import { QlikRepositoryClient } from "qlik-rest-api";
import {
  ISelection,
  IHttpReturn,
  IEntityRemove,
  ICompositeEvent,
  IExternalProgramTask,
  ISchemaEvent,
  ITask,
  ITaskCreateTriggerComposite,
  ITaskCreateTriggerSchema,
  ITaskExecutionResult,
} from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { IClassSchemaTrigger, SchemaTrigger } from "./SchemaTrigger";
import { CompositeTrigger, IClassCompositeTrigger } from "./CompositeTrigger";
import { schemaRepeat } from "./util/schemaTrigger";
import { ReloadTaskBaseTriggersActions } from "./ReloadTaskBase_Triggers";

export interface IClassReloadTaskBase {
  remove(): Promise<IHttpStatus>;
  start(): Promise<IHttpStatus>;
  startSynchronous(): Promise<IHttpReturn>;
  waitExecution(arg?: { executionId: string }): Promise<ITaskExecutionResult>;
  triggers: ReloadTaskBaseTriggersActions;
  // TODO: breaking change! move add/remove trigger methods into their own property?
  // addTriggerComposite(
  //   arg: ITaskCreateTriggerComposite
  // ): Promise<IClassCompositeTrigger>;
  // addTriggerSchema(arg: ITaskCreateTriggerSchema): Promise<IClassSchemaTrigger>;
  // addTriggerMany(
  //   triggers: (ITaskCreateTriggerComposite | ITaskCreateTriggerSchema)[]
  // ): Promise<(IClassSchemaTrigger | IClassCompositeTrigger)[]>;
  // removeAllTriggers(arg?: {
  //   onlyDisabled?: boolean;
  //   onlyEnabled?: boolean;
  // }): Promise<IEntityRemove[]>;
  details: ITask | IExternalProgramTask;
  // triggersDetails: (IClassSchemaTrigger | IClassCompositeTrigger)[];
}

export abstract class ReloadTaskBase implements IClassReloadTaskBase {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: ITask | IExternalProgramTask;
  #triggersDetails: (IClassSchemaTrigger | IClassCompositeTrigger)[];
  #baseUrl: string;
  triggers: ReloadTaskBaseTriggersActions;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    baseUrl: string,
    details?: ITask | IExternalProgramTask
  ) {
    if (!id) throw new Error(`reloadTasks.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    this.#baseUrl = baseUrl;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      [this.details, this.#triggersDetails] = await this.getTaskDetails();

      this.triggers = new ReloadTaskBaseTriggersActions(
        this.#repoClient,
        this.details,
        this.#triggersDetails
      );
    }

    if (!this.#triggersDetails) {
      this.#triggersDetails = await this.triggersGetAll();

      this.triggers = new ReloadTaskBaseTriggersActions(
        this.#repoClient,
        this.details,
        this.#triggersDetails
      );
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
        .Get<{ executionResult: { Id: string } }>(
          `/executionSession/${arg.executionId}`
        )
        .then((res) => {
          return res.data.executionResult.Id;
        });
    }

    let result: ITaskExecutionResult;
    while (taskStatusCode < 3) {
      result = await this.#repoClient
        .Get<ITaskExecutionResult>(`/executionResult/${resultId}`)
        .then((res) => {
          return res.data;
        });

      taskStatusCode = result.status;
    }

    return result;
  }

  /**
   * Add task trigger that depends on another task result (success of fail)
   */
  // async addTriggerComposite(arg: ITaskCreateTriggerComposite) {
  //   if (arg.eventTasks.length == 0)
  //     throw new Error(
  //       `task.createCompositeTrigger: at least one reload task is required`
  //     );
  //   if (!arg.name)
  //     throw new Error(
  //       `task.createCompositeTrigger: "triggerName" parameter is required`
  //     );

  //   // TODO: convert to CompositeTrigger instance
  //   const reloadTasks = await Promise.all(
  //     arg.eventTasks.map(async (r) => {
  //       if (!r.id && !r.filter)
  //         throw new Error(
  //           `task.createCompositeTrigger: "eventTasks.id" or "eventTasks.name" parameter is required`
  //         );
  //       if (!r.state)
  //         `task.createCompositeTrigger: "eventTasks.state" parameter is required`;
  //       if (r.state != "fail" && r.state != "success")
  //         throw new Error(
  //           `task.createCompositeTrigger: "eventTasks.state" value must be "success" or "fail" but provided "${r.state}"`
  //         );

  //       let ruleState = -1;
  //       if (r.state == "fail") ruleState = 2;
  //       if (r.state == "success") ruleState = 1;

  //       // if task id is specified (ignore the name parameter)
  //       if (r.id) {
  //         return {
  //           reloadTask: {
  //             id: `${r.id}`,
  //           },
  //           ruleState: ruleState,
  //         };
  //       }

  //       // if task id is not specified then find the id based on the provided name
  //       const task = await this.#repoClient
  //         .Get<ITask[]>(`task?filter=(name eq '${r.filter}')`)
  //         .then((t) => t.data);

  //       if (task.length > 1)
  //         throw new Error(
  //           `task.createCompositeTrigger: more than one task with name "${r.filter}" exists`
  //         );
  //       if (task.length == 0)
  //         throw new Error(
  //           `task.createCompositeTrigger:task with name "${r.filter}" do not exists`
  //         );

  //       return {
  //         reloadTask: {
  //           id: task[0].id,
  //         },
  //         ruleState: ruleState,
  //       };
  //     })
  //   );

  //   const updateObject = {
  //     compositeEvents: [
  //       {
  //         compositeRules: reloadTasks,
  //         enabled: arg.enabled || true,
  //         eventType: 1,
  //         name: `${arg.name}`,
  //         privileges: ["read", "update", "create", "delete"],
  //         reloadTask: {
  //           id: this.details.id,
  //           name: this.details.name,
  //         },
  //         timeConstraint: {
  //           days: 0,
  //           hours: 0,
  //           minutes: 360,
  //           seconds: 0,
  //         },
  //       },
  //     ],
  //   };

  //   // TODO: capture error status
  //   const createResponse = await this.#repoClient
  //     .Post<number>(`reloadtask/update`, { ...updateObject })
  //     .then((res) => res.status);

  //   const triggersDetails = [...this.triggersDetails].map((t) => t.details.id);

  //   [this.details, this.triggersDetails] = await this.getTaskDetails();

  //   const newTriggerDetails = this.triggersDetails.filter((t) => {
  //     return !triggersDetails.includes(t.details.id);
  //   })[0];

  //   const newCompositeTrigger = new CompositeTrigger(
  //     this.#repoClient,
  //     newTriggerDetails.details.id,
  //     newTriggerDetails.details as ICompositeEvent
  //   );

  //   return newCompositeTrigger;
  // }

  /**
   * Add task trigger based on schema - daily, weekly, monthly, repeat every X etc.
   */
  // async addTriggerSchema(arg: ITaskCreateTriggerSchema) {
  //   if (!arg.name)
  //     throw new Error(`task.triggerCreateSchema: "name" parameter is required`);

  //   let currentTimeStamp = new Date();

  //   let schemaRepeatOpt = schemaRepeat(
  //     arg.repeat || "Daily",
  //     arg.repeatEvery || 1,
  //     arg.daysOfWeek || ["Monday"],
  //     arg.daysOfMonth || [1]
  //   );

  //   let daylightSaving = 1;
  //   if (arg.daylightSavingTime != undefined)
  //     daylightSaving = arg.daylightSavingTime ? 0 : 1;

  //   let createObj: { [k: string]: any } = {};
  //   createObj["name"] = arg.name;
  //   createObj["timeZone"] = arg.timeZone || "UTC";
  //   createObj["daylightSavingTime"] = daylightSaving;
  //   createObj["startDate"] = arg.startDate || currentTimeStamp.toISOString();
  //   createObj["expirationDate"] =
  //     arg.expirationDate || "9999-01-01T00:00:00.000";
  //   createObj["schemaFilterDescription"] = [schemaRepeatOpt.schemaFilterDescr];
  //   createObj["incrementDescription"] = schemaRepeatOpt.incrementDescr;
  //   createObj["incrementOption"] = 1;
  //   createObj["eventType"] = 0;
  //   createObj["enabled"] = arg.enabled || true;

  //   if (this.details.taskType == 0) {
  //     createObj["reloadTask"] = this.details;
  //     createObj["externalProgramTask"] = null;
  //     createObj["userSyncTask"] = null;
  //   }

  //   if (this.details.taskType == 1) {
  //     createObj["externalProgramTask"] = this.details;
  //     createObj["reloadTask"] = null;
  //     createObj["userSyncTask"] = null;
  //   }

  //   const createResponse = await this.#repoClient
  //     .Post(`schemaevent`, { ...createObj })
  //     .then((res) => res.status);

  //   const triggersDetails = [...this.triggersDetails].map((t) => t.details.id);

  //   [this.details, this.triggersDetails] = await this.getTaskDetails();

  //   const newTriggerDetails = this.triggersDetails.filter((t) => {
  //     return !triggersDetails.includes(t.details.id);
  //   })[0];

  //   const newCompositeTrigger = new SchemaTrigger(
  //     this.#repoClient,
  //     newTriggerDetails.details.id,
  //     newTriggerDetails.details as ISchemaEvent
  //   );

  //   return newCompositeTrigger;
  // }

  /**
   * Add multiple task triggers in one go. Triggers can be of multiple types - composite and/or schema
   */
  // async addTriggerMany(
  //   triggers: (ITaskCreateTriggerComposite | ITaskCreateTriggerSchema)[]
  // ) {
  //   // TODO: optimization here. Can we update the task in one run?
  //   //       atm we are making calls for each trigger. Not very efficient
  //   let newTriggers: (IClassSchemaTrigger | IClassCompositeTrigger)[] = [];
  //   for (let trigger of triggers) {
  //     if ((trigger as ITaskCreateTriggerComposite).eventTasks) {
  //       let newCompTrigger = await this.addTriggerComposite(
  //         trigger as ITaskCreateTriggerComposite
  //       );

  //       newTriggers.push(newCompTrigger);
  //     }

  //     if ((trigger as ITaskCreateTriggerSchema).repeat) {
  //       let newSchemaTrigger = await this.addTriggerSchema(
  //         trigger as ITaskCreateTriggerSchema
  //       );

  //       newTriggers.push(newSchemaTrigger);
  //     }
  //   }

  //   return newTriggers;
  // }

  // async removeAllTriggers(arg?: {
  //   onlyDisabled?: boolean;
  //   onlyEnabled?: boolean;
  // }) {
  //   let res: IEntityRemove[] = [];

  //   // make sure we have the latest data before execution
  //   [this.details, this.triggersDetails] = await this.getTaskDetails();

  //   let localTriggers: (IClassCompositeTrigger | IClassSchemaTrigger)[] = [];

  //   if (arg && arg.onlyDisabled)
  //     localTriggers = this.triggersDetails.filter((tr) => !tr.details.enabled);

  //   if (arg && arg.onlyEnabled)
  //     localTriggers = this.triggersDetails.filter((tr) => tr.details.enabled);

  //   if (!arg || (arg.onlyEnabled == undefined && arg.onlyDisabled == undefined))
  //     localTriggers = [...this.triggersDetails];

  //   for (let trigger of localTriggers) {
  //     let delRes = await trigger.remove();
  //     res.push(delRes);
  //   }

  //   [this.details, this.triggersDetails] = await this.getTaskDetails();

  //   return res;
  // }

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
