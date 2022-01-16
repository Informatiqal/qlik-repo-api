import { QlikRepositoryClient } from "qlik-rest-api";
import { IHttpStatus, ISelection, IHttpReturn } from "./types/interfaces";
import {
  ISchemaEvent,
  ITask,
  ITaskCreateTriggerComposite,
  ITaskCreateTriggerSchema,
  ITaskExecutionResult,
  ITaskReloadUpdate,
} from "./Task.interface";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { IClassSchemaTrigger, SchemaTrigger } from "./SchemaTrigger";
import { CompositeTrigger, IClassCompositeTrigger } from "./CompositeTrigger";
import { TDaysOfMonth, TDaysOfWeek, TRepeatOptions } from "./types/ranges";
import { schemaRepeat } from "./util/schemaTrigger";

export interface IClassReloadTask {
  remove(): Promise<IHttpStatus>;
  start(): Promise<IHttpStatus>;
  startSynchronous(): Promise<IHttpReturn>;
  waitExecution(arg: { executionId?: string }): Promise<ITaskExecutionResult>;
  scriptLogGet(arg: { fileReferenceId: string }): Promise<string>;
  scriptLogFileGet(arg: { executionResultId: string }): Promise<string>;
  update(arg: ITaskReloadUpdate): Promise<ITask>;
  addTriggerComposite(arg: ITaskCreateTriggerComposite): Promise<IHttpStatus>;
  addTriggerSchema(arg: ITaskCreateTriggerSchema): Promise<IHttpStatus>;
  addTriggerMany(
    triggers: (ITaskCreateTriggerComposite | ITaskCreateTriggerSchema)[]
  ): Promise<{ name: string; status: number }[]>;
  // triggersGetAll(): Promise<IClassSchemaTrigger[]>;
  // triggersGetSchema(id: string): Promise<IClassSchemaTrigger>;
  details: ITask;
  triggersDetails: (IClassSchemaTrigger | IClassCompositeTrigger)[];
}

export abstract class ReloadTaskBase implements IClassReloadTask {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: ITask;
  triggersDetails: (IClassSchemaTrigger | IClassCompositeTrigger)[];
  baseUrl: string;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    baseUrl: string,
    details?: ITask
  ) {
    if (!id) throw new Error(`reloadTasks.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    this.baseUrl = baseUrl;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      [this.details, this.triggersDetails] = await this.getTaskDetails();
    }
  }

  public async remove() {
    return await this.repoClient
      .Delete(`${this.baseUrl}/${this.id}`)
      .then((res) => res.status);
  }

  async start() {
    return await this.repoClient
      .Post(`task/${this.id}/start`, {})
      .then((res) => res.status);
  }

  async startSynchronous() {
    return await this.repoClient.Post(`task/${this.id}/start/synchronous`, {});
  }

  async waitExecution(arg: { executionId?: string }) {
    let taskStatusCode = -1;
    let resultId: string;

    if (!arg.executionId)
      resultId = this.details.operational.lastExecutionResult.id;

    if (arg.executionId) {
      resultId = await this.repoClient
        .Get(`/executionSession/${arg.executionId}`)
        .then((res) => {
          return res.data.executionResult.Id;
        });
    }

    let result: ITaskExecutionResult;
    while (taskStatusCode < 3) {
      result = await this.repoClient
        .Get(`/executionResult/${resultId}`)
        .then((res) => {
          return res.data;
        });

      taskStatusCode = (result as any).status;
    }

    return result;
  }

  async scriptLogGet(arg: { fileReferenceId: string }) {
    if (!arg.fileReferenceId)
      throw new Error(
        `task.scriptLogGet: "fileReferenceId" parameter is required`
      );
    if (this.baseUrl == "externalprogramtask")
      throw new Error(
        `scriptLogGet: Unfortunately only task of type Reload have this option `
      );

    return await this.repoClient
      .Get(
        `${this.baseUrl}/${
          this.details.id
        }/scriptlog?filereferenceid=${encodeURIComponent(arg.fileReferenceId)}
    `
      )
      .then((res) => res.data as string);
  }

  async scriptLogFileGet(arg: { executionResultId: string }) {
    if (!arg.executionResultId)
      throw new Error(
        `task.scriptLogFileGet: "executionResultId" parameter is required`
      );

    if (this.baseUrl == "externalprogramtask")
      throw new Error(
        `scriptLogGet: Unfortunately only task of type Reload have this option `
      );

    return await this.repoClient
      .Get(
        `${this.baseUrl}/${
          this.details.id
        }/scriptlog?executionresultid =${encodeURIComponent(
          arg.executionResultId
        )}
  `
      )
      .then((res) => res.data as string);
  }

  async update(arg: ITaskReloadUpdate) {
    if (arg.enabled) this.details.enabled = arg.enabled;
    if (arg.taskSessionTimeout)
      this.details.taskSessionTimeout = arg.taskSessionTimeout;
    if (arg.maxRetries) this.details.maxRetries = arg.maxRetries;

    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      this.details,
      arg
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`${this.baseUrl}/${this.details.id}`, { ...this.details })
      .then((res) => res.data as ITask);
  }

  /**
   * Add task trigger that depends on another task result (success of fail)
   */
  async addTriggerComposite(arg: ITaskCreateTriggerComposite) {
    if (arg.eventTasks.length == 0)
      throw new Error(
        `task.createCompositeTrigger: at least one reload task is required`
      );
    if (!arg.name)
      throw new Error(
        `task.createCompositeTrigger: "triggerName" parameter is required`
      );

    const reloadTasks = await Promise.all(
      arg.eventTasks.map(async (r) => {
        if (!r.id && !r.name)
          throw new Error(
            `task.createCompositeTrigger: "eventTasks.id" or "eventTasks.name" parameter is required`
          );
        if (!r.state)
          `task.createCompositeTrigger: "eventTasks.state" parameter is required`;

        let ruleState = -1;
        if (r.state == "fail") ruleState = 2;
        if (r.state == "success") ruleState = 1;

        // if task id is specified (ignore the name parameter)
        if (r.id) {
          return {
            reloadTask: {
              id: `${r.id}`,
            },
            ruleState: ruleState,
          };
        }

        // if task id is not specified then find the id based on the provided name
        const task = await this.repoClient
          .Get(`task?filter=(name eq '${r.name}')`)
          .then((t) => t.data as ITask[]);

        if (task.length > 1)
          throw new Error(
            `task.createCompositeTrigger: more than one task with name "${r.name}" exists`
          );
        if (task.length == 0)
          throw new Error(
            `task.createCompositeTrigger:task with name "${r.name}" do not exists`
          );

        return {
          reloadTask: {
            id: task[0].id,
          },
          ruleState: ruleState,
        };
      })
    );

    let updateObject = {
      compositeEvents: [
        {
          compositeRules: reloadTasks,
          enabled: arg.enabled || true,
          eventType: 1,
          name: `${arg.name}`,
          privileges: ["read", "update", "create", "delete"],
          reloadTask: {
            id: `${this.id}`,
          },
          timeConstraint: {
            days: 0,
            hours: 0,
            minutes: 360,
            seconds: 0,
          },
        },
      ],
    };

    const createResponse = await this.repoClient
      .Post(`ReloadTask/update`, { ...updateObject })
      .then((res) => {
        return res.status as IHttpStatus;
      });

    [this.details, this.triggersDetails] = await this.getTaskDetails();

    return createResponse;
  }

  /**
   * Add task trigger based on schema - daily, weekly, monthly, repeat every X etc.
   */
  async addTriggerSchema(arg: ITaskCreateTriggerSchema) {
    if (!arg.name)
      throw new Error(`task.triggerCreateSchema: "name" parameter is required`);

    let currentTimeStamp = new Date();

    let schemaRepeatOpt = schemaRepeat(
      arg.repeat || "Daily",
      arg.repeatEvery || 1,
      arg.daysOfWeek || ["Monday"],
      arg.daysOfMonth || [1]
    );

    let daylightSaving = 1;
    if (arg.daylightSavingTime != undefined)
      daylightSaving = arg.daylightSavingTime ? 0 : 1;

    let createObj: { [k: string]: any } = {};
    createObj["name"] = arg.name;
    createObj["timeZone"] = arg.timeZone || "UTC";
    createObj["daylightSavingTime"] = daylightSaving;
    createObj["startDate"] = arg.startDate || currentTimeStamp.toISOString();
    createObj["expirationDate"] =
      arg.expirationDate || "9999-01-01T00:00:00.000";
    createObj["schemaFilterDescription"] = [schemaRepeatOpt.schemaFilterDescr];
    createObj["incrementDescription"] = schemaRepeatOpt.incrementDescr;
    createObj["incrementOption"] = 1;
    createObj["eventType"] = 0;
    createObj["enabled"] = arg.enabled || true;

    if (this.details.taskType == 0) {
      createObj["reloadTask"] = this.details;
      createObj["externalProgramTask"] = null;
      createObj["userSyncTask"] = null;
    }

    if (this.details.taskType == 1) {
      createObj["externalProgramTask"] = this.details;
      createObj["reloadTask"] = null;
      createObj["userSyncTask"] = null;
    }

    const createResponse = await this.repoClient
      .Post(`schemaevent`, { ...createObj })
      .then((res) => res.status as IHttpStatus);

    [this.details, this.triggersDetails] = await this.getTaskDetails();

    return createResponse;
  }

  /**
   * Add multiple task triggers in one go. Triggers can be of multiple types - composite and/or schema
   */
  async addTriggerMany(
    triggers: (ITaskCreateTriggerComposite | ITaskCreateTriggerSchema)[]
  ) {
    return await Promise.all(
      triggers.map(async (t) => {
        if ((t as ITaskCreateTriggerComposite).eventTasks) {
          return this.addTriggerComposite(
            t as ITaskCreateTriggerComposite
          ).then((d) => {
            return { status: d, name: t.name };
          });
        }

        return this.addTriggerSchema(t as ITaskCreateTriggerSchema).then(
          (d) => {
            return { status: d, name: t.name };
          }
        );
      })
    );
  }

  private async triggersGetAll() {
    const type =
      this.baseUrl == "externalprogramtask"
        ? "ExternalProgramTask"
        : "ReloadTask";

    const selection = await this.repoClient
      .Post(`selection`, {
        items: [
          {
            type: type,
            objectID: `${this.id}`,
          },
        ],
      })
      .then((res) => res.data as ISelection);

    const selectionData = await this.repoClient
      .Get(`selection/${selection.id}/Event/full`)
      .then(async (s0) => {
        return await Promise.all(
          (s0.data as ISchemaEvent[]).map(async (s1) => {
            if (s1.eventType == 0) {
              const t: SchemaTrigger = new SchemaTrigger(
                this.repoClient,
                s1.id
              );
              await t.init();

              return t;
            }

            if (s1.eventType == 1) {
              const t: CompositeTrigger = new CompositeTrigger(
                this.repoClient,
                s1.id
              );
              await t.init();

              return t;
            }
          })
        );
      });

    return selectionData;
  }

  private async getTaskDetails() {
    return await Promise.all([
      this.repoClient
        .Get(`${this.baseUrl}/${this.id}`)
        .then((res) => res.data as ITask),
      this.triggersGetAll(),
    ]);
  }
}
