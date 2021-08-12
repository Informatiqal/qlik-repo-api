import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IHttpStatus, IEntityRemove, ISelection } from "./types/interfaces";

import {
  ITask,
  ISchemaEvent,
  ISchemaEventCondensed,
  ITaskCreate,
  ITaskCreateTriggerComposite,
  ITaskCreateTriggerSchema,
  ISelectionEvent,
} from "./Task.interface";

import { TRepeatOptions, TDaysOfMonth, TDaysOfWeek } from "./types/ranges";
import { IClassReloadTask } from "./ReloadTaskBase";
import { ExternalTask } from "./ExternalTask";

export interface IClassExternalTasks {
  get(id: string): Promise<IClassReloadTask>;
  getAll(): Promise<IClassReloadTask[]>;
  getFilter(filter: string): Promise<IClassReloadTask[]>;
  count(filter?: string): Promise<number>;
  select(filter?: string): Promise<ISelection>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  // reloadUpdate(arg: ITaskReloadUpdate): Promise<ITask>;
  create(arg: ITaskCreate): Promise<IClassReloadTask>;

  // getAll(): Promise<ITaskCondensed[]>;
  // getFilter(filter: string): Promise<ITask[]>;
  // reloadGet(id: string): Promise<ITask>;
  // reloadRemove(id: string): Promise<IEntityRemove>;
  // externalGetAll(): Promise<ITask[]>;
  // externalRemove(id: string): Promise<IEntityRemove>;
  // start(id: string, wait?: boolean): Promise<IHttpStatus>;
  // startByName(name: string, wait: boolean): Promise<IHttpStatus>;
  // waitExecution(
  //   taskId: string,
  //   executionId?: string
  // ): Promise<ITaskExecutionResult>;
  // scheduleRemove(id: string): Promise<IEntityRemove>;
  // scheduleGet(id: string): Promise<ISchemaEvent>;
  // scheduleGetAll(): Promise<ISchemaEventCondensed[]>;
  // triggerCompositeCreate(
  //   arg: ITaskCreateTriggerComposite
  // ): Promise<IHttpStatus>;
  // triggersForTask(id: string): Promise<ISelectionEvent[]>;
  // triggerSchemaCreate(arg: ITaskCreateTriggerSchema): Promise<ISchemaEvent>;
  // triggerSchemaRemove(id: string): Promise<IEntityRemove>;
  // triggerSchemaGet(id: string): Promise<ISchemaEvent>;
  // triggerSchemaGetAll(): Promise<ISchemaEvent[]>;
  // triggerSchemaGetFilter(filter: string): Promise<ISchemaEvent[]>;
  // scriptLogGet(reloadTaskId: string, fileReferenceId: string): Promise<string>;
  // scriptLogFileGet(
  //   reloadTaskId: string,
  //   executionResultId: string
  // ): Promise<string>;
}

export class ExternalTasks implements IClassExternalTasks {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`reloadTasks.get: "id" parameter is required`);

    const extTask: ExternalTask = new ExternalTask(this.repoClient, id);
    await extTask.init();

    return extTask;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`externalprogramtask/full`)
      .then((res) => res.data as ITask[])
      .then((data) => {
        return data.map((t) => {
          return new ExternalTask(this.repoClient, t.id, t);
        });
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`reloadTasks.getFilter: "path" parameter is required`);

    return await this.repoClient
      .Get(`externalprogramtask/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITask[])
      .then((data) => {
        return data.map((t) => {
          return new ExternalTask(this.repoClient, t.id, t);
        });
      });
  }

  public async count(filter?: string) {
    let url: string = `externalprogramtask/count`;
    if (filter) url += `${url}?filter=(${encodeURIComponent(filter)})`;

    return await this.repoClient
      .Get(`${url}`)
      .then((res) => res.data.value as number);
  }

  // public async reloadUpdate(arg: ITaskReloadUpdate) {
  //   if (!arg.id) throw new Error(`task.update: "id" parameter is required`);

  //   let reloadTask: ITask = await this.reloadGet(arg.id);

  //   if (arg.enabled) reloadTask.enabled = arg.enabled;
  //   if (arg.taskSessionTimeout)
  //     reloadTask.taskSessionTimeout = arg.taskSessionTimeout;
  //   if (arg.maxRetries) reloadTask.maxRetries = arg.maxRetries;

  //   let updateCommon = new UpdateCommonProperties(
  //     this.repoClient,
  //     reloadTask,
  //     arg
  //   );
  //   reloadTask = await updateCommon.updateAll();

  //   return await this.repoClient
  //     .Put(`reloadtask/${arg.id}`, { ...reloadTask })
  //     .then((res) => res.data as ITask);
  // }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `reloadTasks.removeFilter: "filter" parameter is required`
      );

    const tasks = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      tasks.map((task: IClassReloadTask) => {
        return task.remove();
      })
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/externalprogramtask`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async create(arg: ITaskCreate) {
    if (!arg.appId)
      throw new Error(`task.create: "appId" parameter is required`);
    if (!arg.name) throw new Error(`task.create: "name" parameter is required`);

    let reloadTask = {
      schemaEvents: [],
      compositeEvents: [],
      task: {
        name: arg.name,
        app: { id: arg.appId },
        taskType: 0,
        enabled: true,
        taskSessionTimeout: 1440,
        maxRetries: 0,
        isManuallyTriggered: false,
        tags: [],
        customProperties: [],
      },
    };

    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      reloadTask,
      arg
    );
    reloadTask = await updateCommon.updateAll();

    reloadTask.task.customProperties = (reloadTask as any).customProperties;
    reloadTask.task.tags = (reloadTask as any).tags;

    delete (reloadTask as any).modifiedDate;
    delete (reloadTask as any).customProperties;
    delete (reloadTask as any).tags;

    return await this.repoClient
      .Post(`reloadtask/create`, { ...reloadTask })
      .then((res) => res.data as ITask)
      .then((t) => new ExternalTask(this.repoClient, t.id, t));
  }

  // public async externalGetAll() {
  //   return await this.getFilter("taskType eq 2");
  // }

  // public async externalRemove(id: string) {
  //   if (!id) throw new Error(`task.externalRemove: "id" parameter is required`);

  //   return await this.repoClient
  //     .Delete(`externalprogramtask/${id}`)
  //     .then((res) => {
  //       return { id, status: res.status } as IEntityRemove;
  //     });
  // }

  // public async start(id: string, wait: boolean = false) {
  //   if (!id) throw new Error(`task.start: "id" parameter is required`);

  //   let url = `task/${id}/start`;
  //   if (wait) url += `/synchronous`;

  //   return await this.repoClient
  //     .Post(`${url}`, {})
  //     .then((res) => res.status as IHttpStatus);
  // }

  // public async startByName(name: string, wait: boolean = false) {
  //   if (!name)
  //     throw new Error(`task.startByName: "path" parameter is required`);

  //   let url = `task/start`;
  //   if (wait) url += `/synchronous`;
  //   url += `?name=${name}`;

  //   return await this.repoClient
  //     .Post(`${url}`, {})
  //     .then((res) => res.status as IHttpStatus);
  // }

  // public async waitExecution(taskId: string, executionId?: string) {
  //   if (!taskId)
  //     throw new Error(`task.waitExecution: "taskId" parameter is required`);
  //   let taskStatusCode = -1;
  //   let resultId: string;

  //   if (!executionId) {
  //     resultId = await this.getFilter(`id eq ${taskId}`).then((t) => {
  //       return t[0].operational.lastExecutionResult.id;
  //     });
  //   }

  //   if (executionId) {
  //     resultId = await this.repoClient
  //       .Get(`/executionSession/${executionId}`)
  //       .then((res) => {
  //         return res.data.executionResult.Id;
  //       });
  //   }

  //   let result: ITaskExecutionResult;
  //   while (taskStatusCode < 3) {
  //     result = await this.repoClient
  //       .Get(`/executionResult/${resultId}`)
  //       .then((res) => {
  //         return res.data;
  //       });

  //     taskStatusCode = (result as any).status;
  //   }

  //   return result;
  // }

  //

  public async scheduleRemove(id: string) {
    if (!id) throw new Error(`task.scheduleRemove: "id" parameter is required`);
    return await this.repoClient.Delete(`schemaevent/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async scheduleGet(id: string) {
    if (!id) throw new Error(`task.scheduleGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`schemaevent/${id}`)
      .then((res) => res.data as ISchemaEvent);
  }

  public async scheduleGetAll() {
    return await this.repoClient
      .Get(`schemaevent`)
      .then((res) => res.data as ISchemaEventCondensed[]);
  }

  public async triggerCompositeCreate(arg: ITaskCreateTriggerComposite) {
    if (arg.eventTasks.length == 0)
      throw new Error(
        `task.triggerCreateComposite: at least one reload task is required`
      );
    if (!arg.taskId)
      throw new Error(
        `task.triggerCreateComposite: "taskId" parameter is required`
      );
    if (!arg.triggerName)
      throw new Error(
        `task.triggerCreateComposite: "triggerName" parameter is required`
      );

    const reloadTasks = arg.eventTasks.map((r) => {
      if (!r.id)
        throw new Error(
          `task.triggerCreateComposite: "eventTasks.id" parameter is required`
        );
      if (!r.state)
        `task.triggerCreateComposite: "eventTasks.state" parameter is required`;
      let ruleState = -1;
      if (r.state == "fail") ruleState = 2;
      if (r.state == "success") ruleState = 1;

      return {
        reloadTask: {
          id: `${r.id}`,
        },
        ruleState: ruleState,
      };
    });

    let updateObject = {
      compositeEvents: [
        {
          compositeRules: reloadTasks,
          enabled: true,
          eventType: 1,
          name: `${arg.triggerName}`,
          privileges: ["read", "update", "create", "delete"],
          reloadTask: {
            id: `${arg.taskId}`,
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

    return await this.repoClient
      .Post(`ReloadTask/update`, { ...updateObject })
      .then((res) => {
        return res.status as IHttpStatus;
      });
  }

  public async triggerCompositeUpdate(arg: ITaskCreateTriggerComposite) {
    if (arg.eventTasks.length == 0)
      throw new Error(
        `task.triggerCreateComposite: at least one reload task is required`
      );
    if (!arg.taskId)
      throw new Error(
        `task.triggerCreateComposite: "taskId" parameter is required`
      );
    if (!arg.triggerName)
      throw new Error(
        `task.triggerCreateComposite: "triggerName" parameter is required`
      );

    const reloadTasks = arg.eventTasks.map((r) => {
      if (!r.id)
        throw new Error(
          `task.triggerCreateComposite: "eventTasks.id" parameter is required`
        );
      if (!r.state)
        `task.triggerCreateComposite: "eventTasks.state" parameter is required`;
      let ruleState = -1;
      if (r.state == "fail") ruleState = 2;
      if (r.state == "success") ruleState = 1;

      return {
        reloadTask: {
          id: `${r.id}`,
        },
        ruleState: ruleState,
      };
    });

    let updateObject = {
      compositeEvents: [
        {
          compositeRules: reloadTasks,
          enabled: true,
          eventType: 1,
          name: `${arg.triggerName}`,
          privileges: ["read", "update", "create", "delete"],
          reloadTask: {
            id: `${arg.taskId}`,
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

    return await this.repoClient
      .Post(`ReloadTask/update`, { ...updateObject })
      .then((res) => {
        return res.status as IHttpStatus;
      });
  }

  public async triggerSchemaCreate(arg: ITaskCreateTriggerSchema) {
    if (!arg.name)
      throw new Error(`task.triggerCreateSchema: "name" parameter is required`);
    if (!arg.reloadTaskId)
      throw new Error(
        `task.triggerCreateSchema: "reloadTaskId" parameter is required`
      );

    let currentTimeStamp = new Date();

    let schemaRepeatOpt = this.schemaRepeat(
      arg.repeat || "Daily",
      arg.repeatEvery || 1,
      arg.daysOfWeek || ["Monday"],
      arg.daysOfMonth || [1]
    );

    const reloadTaskDetails = await this.getFilterCondensed(
      `id eq ${arg.reloadTaskId}`
    ).then((r) => r[0]);
    if (!reloadTaskDetails)
      throw new Error(
        `task.triggerCreateSchema: taskId "${arg.reloadTaskId}" not found`
      );

    if (!reloadTaskDetails)
      throw new Error(
        `task.triggerCreateSchema: taskId "${arg.reloadTaskId}" not found`
      );

    let createObj = {
      name: arg.name,
      timeZone: arg.timeZone || "UTC",
      daylightSavingTime: arg.daylightSavingTime ? 0 : 1,
      startDate: arg.startDate || currentTimeStamp.toISOString(),
      expirationDate: arg.expirationDate || "9999-01-01T00:00:00.000",
      schemaFilterDescription: [schemaRepeatOpt.schemaFilterDescr],
      incrementDescription: schemaRepeatOpt.incrementDescr,
      incrementOption: 1,
      eventType: 0,
      enabled: true,
    };

    if (reloadTaskDetails.taskType == 0) {
      createObj["reloadTask"] = reloadTaskDetails;
      createObj["externalProgramTask"] = null;
      createObj["userSyncTask"] = null;
    }

    if (reloadTaskDetails.taskType == 1) {
      createObj["externalProgramTask"] = reloadTaskDetails;
      createObj["reloadTask"] = null;
      createObj["userSyncTask"] = null;
    }

    return await this.repoClient
      .Post(`schemaevent`, { ...createObj })
      .then((res) => res.data as ISchemaEvent);
  }

  public async triggerSchemaRemove(id: string): Promise<IEntityRemove> {
    if (!id)
      throw new Error(`task.triggerSchemaRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`schemaevent/${id}`).then((r) => {
      return { id, status: r.status } as IEntityRemove;
    });
  }

  public async triggerSchemaGet(id: string) {
    if (!id)
      throw new Error(`task.triggerSchemaGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`schemaevent/${id}`)
      .then((res) => res.data as ISchemaEvent);
  }

  public async triggerSchemaGetAll() {
    return await this.repoClient
      .Get(`schemaevent`)
      .then((res) => res.data as ISchemaEvent[]);
  }

  public async triggerSchemaGetFilter(filter: string) {
    if (!filter)
      throw new Error(
        `task.triggerSchemaGetFilter: "path" parameter is required`
      );

    return await this.repoClient
      .Get(`schemaevent/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ISchemaEvent[]);
  }

  public async triggersForTask(id: string) {
    if (!id)
      throw new Error(`task.triggersForTask: "id" parameter is required`);

    const selection = await this.repoClient
      .Post(`selection`, {
        items: [
          {
            type: "ReloadTask",
            objectID: `${id}`,
          },
        ],
      })
      .then((res) => res.data as ISelection);

    const selectionData = await this.repoClient
      .Get(`selection/${selection.id}/Event`)
      .then((s) => s.data as ISelectionEvent[]);

    await this.repoClient.Delete(`selection/${selection.id}`);

    return selectionData;
  }

  // public async scriptLogGet(reloadTaskId: string, fileReferenceId: string) {
  //   if (!reloadTaskId)
  //     throw new Error(
  //       `task.scriptLogGet: "reloadTaskId" parameter is required`
  //     );
  //   if (!fileReferenceId)
  //     throw new Error(
  //       `task.scriptLogGet: "fileReferenceId" parameter is required`
  //     );

  //   return await this.repoClient
  //     .Get(
  //       `/reloadtask/${reloadTaskId}/scriptlog?filereferenceid=${encodeURIComponent(
  //         fileReferenceId
  //       )}
  //   `
  //     )
  //     .then((res) => res.data as string);
  // }

  // public async scriptLogFileGet(
  //   reloadTaskId: string,
  //   executionResultId: string
  // ) {
  //   if (!reloadTaskId)
  //     throw new Error(
  //       `task.scriptLogFileGet: "reloadTaskId" parameter is required`
  //     );
  //   if (!executionResultId)
  //     throw new Error(
  //       `task.scriptLogFileGet: "executionResultId" parameter is required`
  //     );

  //   return await this.repoClient
  //     .Get(
  //       `/reloadtask/${reloadTaskId}/scriptlog?executionresultid =${encodeURIComponent(
  //         executionResultId
  //       )}
  // `
  //     )
  //     .then((res) => res.data as string);
  // }

  private schemaRepeat(
    repeat: TRepeatOptions,
    repeatEvery: number,
    daysOfWeek: TDaysOfWeek[],
    daysOfMonth: TDaysOfMonth[]
  ): { incrementDescr: string; schemaFilterDescr: string } {
    if (repeat == "Once")
      return {
        incrementDescr: "0 0 0 0",
        schemaFilterDescr: "* * - * * * * *",
      };

    if (repeat == "Minute")
      return {
        incrementDescr: `${repeatEvery} 0 0 0`,
        schemaFilterDescr: "* * - * * * * *",
      };

    if (repeat == "Hourly")
      return {
        incrementDescr: `0 ${repeatEvery} 0 0`,
        schemaFilterDescr: "* * - * * * * *",
      };

    if (repeat == "Daily")
      return {
        incrementDescr: `0 0 ${repeatEvery} 0`,
        schemaFilterDescr: "* * - * * * * *",
      };

    if (repeat == "Weekly") {
      let weekDay = this.getWeekDayNumber(daysOfWeek);
      return {
        incrementDescr: `0 0 1 0`,
        schemaFilterDescr: `* * - ${weekDay} ${repeatEvery} * * *`,
      };
    }

    if (repeat == "Monthly")
      return {
        incrementDescr: `0 0 1 0`,
        schemaFilterDescr: `* * - * * ${daysOfMonth} * *`,
      };
  }

  private getWeekDayNumber(daysOfWeek: TDaysOfWeek[]): number[] {
    return daysOfWeek.map((d) => {
      if (d == "Sunday") return 0;
      if (d == "Monday") return 1;
      if (d == "Tuesday") return 2;
      if (d == "Wednesday") return 3;
      if (d == "Thursday") return 4;
      if (d == "Friday") return 5;
      if (d == "Saturday") return 6;
    });
  }

  private async getFilterCondensed(filter: string) {
    return await this.repoClient
      .Get(`task?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITask[]);
  }
}
