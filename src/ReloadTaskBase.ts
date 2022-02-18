import { QlikRepositoryClient } from "qlik-rest-api";
import {
  IHttpStatus,
  ISelection,
  IHttpReturn,
  IUpdateObjectOptions,
} from "./types/interfaces";
import {
  ICompositeEvent,
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
// import { TDaysOfMonth, TDaysOfWeek, TRepeatOptions } from "./types/ranges";
import { schemaRepeat } from "./util/schemaTrigger";
import { getAppForReloadTask } from "./util/ReloadTaskUtil";
import { uuid } from "./util/generic";

export interface IClassReloadTaskBase {
  remove(): Promise<IHttpStatus>;
  start(): Promise<IHttpStatus>;
  startSynchronous(): Promise<IHttpReturn>;
  waitExecution(arg?: { executionId: string }): Promise<ITaskExecutionResult>;
  // scriptLogGet(arg: { fileReferenceId: string }): Promise<string>;
  // scriptLogFileGet(arg: { executionResultId: string }): Promise<string>;
  update(
    arg: ITaskReloadUpdate,
    options?: IUpdateObjectOptions
  ): Promise<ITask>;
  addTriggerComposite(
    arg: ITaskCreateTriggerComposite
  ): Promise<IClassCompositeTrigger>;
  addTriggerSchema(arg: ITaskCreateTriggerSchema): Promise<IClassSchemaTrigger>;
  addTriggerMany(
    triggers: (ITaskCreateTriggerComposite | ITaskCreateTriggerSchema)[]
  ): Promise<(IClassSchemaTrigger | IClassCompositeTrigger)[]>;
  // triggersGetAll(): Promise<IClassSchemaTrigger[]>;
  // triggersGetSchema(id: string): Promise<IClassSchemaTrigger>;
  details: ITask;
  triggersDetails: (IClassSchemaTrigger | IClassCompositeTrigger)[];
}

export abstract class ReloadTaskBase implements IClassReloadTaskBase {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: ITask;
  triggersDetails: (IClassSchemaTrigger | IClassCompositeTrigger)[];
  #baseUrl: string;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    baseUrl: string,
    details?: ITask
  ) {
    if (!id) throw new Error(`reloadTasks.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    this.#baseUrl = baseUrl;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      [this.details, this.triggersDetails] = await this.getTaskDetails();
    }

    if (!this.triggersDetails) {
      this.triggersDetails = await this.triggersGetAll();
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`${this.#baseUrl}/${this.#id}`)
      .then((res) => res.status);
  }

  async start() {
    return await this.#repoClient
      .Post(`task/${this.#id}/start`, {})
      .then((res) => res.status);
  }

  async startSynchronous() {
    return await this.#repoClient.Post(
      `task/${this.#id}/start/synchronous`,
      {}
    );
  }

  async waitExecution(arg?: { executionId: string }) {
    let taskStatusCode = -1;
    let resultId: string;

    if (!arg.executionId)
      resultId = this.details.operational.lastExecutionResult.id;

    if (arg.executionId) {
      resultId = await this.#repoClient
        .Get(`/executionSession/${arg.executionId}`)
        .then((res) => {
          return res.data.executionResult.Id;
        });
    }

    let result: ITaskExecutionResult;
    while (taskStatusCode < 3) {
      result = await this.#repoClient
        .Get(`/executionResult/${resultId}`)
        .then((res) => {
          return res.data;
        });

      taskStatusCode = (result as any).status;
    }

    return result;
  }

  // async scriptLogGet(arg: { fileReferenceId: string }) {
  //   if (!arg.fileReferenceId)
  //     throw new Error(
  //       `task.scriptLogGet: "fileReferenceId" parameter is required`
  //     );
  //   if (this.baseUrl == "externalprogramtask")
  //     throw new Error(
  //       `scriptLogGet: Unfortunately only task of type Reload have this option `
  //     );

  //   return await this.#repoClient
  //     .Get(
  //       `${this.baseUrl}/${
  //         this.details.id
  //       }/scriptlog?filereferenceid=${encodeURIComponent(arg.fileReferenceId)}
  //   `
  //     )
  //     .then((res) => res.data as string);
  // }

  // async scriptLogFileGet(arg: { executionResultId: string }) {
  //   if (!arg.executionResultId)
  //     throw new Error(
  //       `task.scriptLogFileGet: "executionResultId" parameter is required`
  //     );

  //   if (this.baseUrl == "externalprogramtask")
  //     throw new Error(
  //       `scriptLogGet: Unfortunately only task of type Reload have this option `
  //     );

  //   return await this.#repoClient
  //     .Get(
  //       `${this.baseUrl}/${
  //         this.details.id
  //       }/scriptlog?executionresultid =${encodeURIComponent(
  //         arg.executionResultId
  //       )}
  // `
  //     )
  //     .then((res) => res.data as string);
  // }

  async update(arg: ITaskReloadUpdate, options?: IUpdateObjectOptions) {
    if (arg.enabled) this.details.enabled = arg.enabled;
    if (arg.taskSessionTimeout)
      this.details.taskSessionTimeout = arg.taskSessionTimeout;
    if (arg.maxRetries) this.details.maxRetries = arg.maxRetries;

    if (arg.appId || arg.appFilter) {
      const app = await getAppForReloadTask(
        arg.appId,
        arg.appFilter,
        this.#repoClient
      );
      this.details.app = app.details;
    }

    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put(`${this.#baseUrl}/${this.details.id}`, { ...this.details })
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
        if (r.state != "fail" && r.state != "success")
          throw new Error(
            `task.createCompositeTrigger: "eventTasks.state" value must be "success" or "fail" but provided "${r.state}"`
          );

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
        const task = await this.#repoClient
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

    const updateObject = {
      compositeEvents: [
        {
          compositeRules: reloadTasks,
          enabled: arg.enabled || true,
          eventType: 1,
          name: `${arg.name}`,
          privileges: ["read", "update", "create", "delete"],
          reloadTask: {
            id: this.details.id,
            name: this.details.name,
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

    // TODO: capture error status
    const createResponse = await this.#repoClient
      .Post(`ReloadTask/update`, updateObject)
      .then((res) => {
        return res.status as IHttpStatus;
      });

    const triggersDetails = [...this.triggersDetails].map((t) => t.details.id);

    [this.details, this.triggersDetails] = await this.getTaskDetails();

    const newTriggerDetails = this.triggersDetails.filter((t) => {
      return !triggersDetails.includes(t.details.id);
    })[0];

    const newCompositeTrigger = new CompositeTrigger(
      this.#repoClient,
      newTriggerDetails.details.id,
      newTriggerDetails.details as ICompositeEvent
    );

    return newCompositeTrigger;
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

    const createResponse = await this.#repoClient
      .Post(`schemaevent`, { ...createObj })
      .then((res) => res.status as IHttpStatus);

    const triggersDetails = [...this.triggersDetails].map((t) => t.details.id);

    [this.details, this.triggersDetails] = await this.getTaskDetails();

    const newTriggerDetails = this.triggersDetails.filter((t) => {
      return !triggersDetails.includes(t.details.id);
    })[0];

    const newCompositeTrigger = new SchemaTrigger(
      this.#repoClient,
      newTriggerDetails.details.id,
      newTriggerDetails.details as ISchemaEvent
    );

    return newCompositeTrigger;
  }

  /**
   * Add multiple task triggers in one go. Triggers can be of multiple types - composite and/or schema
   */
  async addTriggerMany(
    triggers: (ITaskCreateTriggerComposite | ITaskCreateTriggerSchema)[]
  ) {
    // TODO: optimization here. Can we update the task in one run?
    //       atm we are making calls for each trigger. Not very efficient
    let newTriggers: (IClassSchemaTrigger | IClassCompositeTrigger)[] = [];
    for (let trigger of triggers) {
      if ((trigger as ITaskCreateTriggerComposite).eventTasks) {
        let newCompTrigger = await this.addTriggerComposite(
          trigger as ITaskCreateTriggerComposite
        );

        newTriggers.push(newCompTrigger);
      }

      if ((trigger as ITaskCreateTriggerSchema).repeat) {
        let newSchemaTrigger = await this.addTriggerSchema(
          trigger as ITaskCreateTriggerSchema
        );

        newTriggers.push(newSchemaTrigger);
      }
    }

    return newTriggers;
  }

  private async triggersGetAll() {
    const type =
      this.#baseUrl == "externalprogramtask"
        ? "ExternalProgramTask"
        : "ReloadTask";

    const selection = await this.#repoClient
      .Post(`selection`, {
        items: [
          {
            type: type,
            objectID: `${this.#id}`,
          },
        ],
      })
      .then((res) => res.data as ISelection);

    const selectionData = await this.#repoClient
      .Get(`selection/${selection.id}/Event/full`)
      .then(async (s0) => {
        return await Promise.all(
          (s0.data as ISchemaEvent[]).map(async (s1) => {
            if (s1.eventType == 0) {
              const t: SchemaTrigger = new SchemaTrigger(
                this.#repoClient,
                s1.id
              );
              await t.init();

              return t;
            }

            if (s1.eventType == 1) {
              const t: CompositeTrigger = new CompositeTrigger(
                this.#repoClient,
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
      this.#repoClient
        .Get(`${this.#baseUrl}/${this.#id}`)
        .then((res) => res.data as ITask),
      this.triggersGetAll(),
    ]);
  }
}
