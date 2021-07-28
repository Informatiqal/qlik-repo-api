import { QlikRepositoryClient } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IHttpStatus, IEntityRemove } from "./types/interfaces";

import {
  ITask,
  ITaskCondensed,
  ITaskExecutionResult,
  ISchemaEvent,
  ISchemaEventCondensed,
  ITaskCreate,
  ITaskReloadUpdate,
  ITaskCreateTriggerComposite,
  ITaskCreateTriggerSchema,
} from "./Task.interface";

import { TRepeatOptions, TDaysOfMonth, TDaysOfWeek } from "./types/ranges";

export interface IClassTask {
  getAll(): Promise<ITaskCondensed[]>;
  getFilter(filter: string): Promise<ITask[]>;
  reloadGet(id: string): Promise<ITask>;
  reloadGetAll(): Promise<ITask[]>;
  reloadGetFilter(filter: string): Promise<ITask[]>;
  reloadCount(filter?: string): Promise<number>;
  reloadUpdate(arg: ITaskReloadUpdate): Promise<ITask>;
  reloadRemove(id: string): Promise<IEntityRemove>;
  externalGetAll(): Promise<ITask[]>;
  externalRemove(id: string): Promise<IEntityRemove>;
  create(arg: ITaskCreate): Promise<ITask>;
  start(id: string, wait: boolean): Promise<IHttpStatus>;
  startByName(name: string, wait: boolean): Promise<IHttpStatus>;
  waitExecution(
    taskId: string,
    executionId?: string
  ): Promise<ITaskExecutionResult>;
  scheduleRemove(id: string): Promise<IEntityRemove>;
  scheduleGet(id: string): Promise<ISchemaEvent>;
  scheduleGetAll(): Promise<ISchemaEventCondensed[]>;
  triggerCreateComposite(
    arg: ITaskCreateTriggerComposite
  ): Promise<IHttpStatus>;
  triggerCreateSchema(arg: ITaskCreateTriggerSchema): Promise<IHttpStatus>;
  scriptLogGet(reloadTaskId: string, fileReferenceId: string): Promise<string>;
  scriptLogFileGet(
    reloadTaskId: string,
    executionResultId: string
  ): Promise<string>;
}

export class Task implements IClassTask {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`task`)
      .then((res) => res.data as ITaskCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter) throw new Error(`taskGetFilter: "path" parameter is required`);

    return await this.repoClient
      .Get(`task/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITask[]);
  }

  public async reloadGet(id: string) {
    if (!id) throw new Error(`taskReloadGet: "id" parameter is required`);

    return await this.repoClient
      .Get(`reloadtask/${id}`)
      .then((res) => res.data as ITask);
  }

  public async reloadGetAll() {
    return await this.getFilter("taskType eq 0");
  }

  public async reloadGetFilter(filter: string) {
    if (!filter)
      throw new Error(`taskReloadGetFilter: "path" parameter is required`);

    return await this.repoClient
      .Get(`reloadtask/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITask[]);
  }

  public async reloadCount(filter?: string) {
    let url: string = `reloadtask/count`;
    if (filter) url += `${url}?filter=(${encodeURIComponent(filter)})`;

    return await this.repoClient
      .Get(`${url}`)
      .then((res) => res.data.value as number);
  }

  public async reloadUpdate(arg: ITaskReloadUpdate) {
    if (!arg.id) throw new Error(`taskUpdate: "id" parameter is required`);

    let reloadTask: ITask = await this.reloadGet(arg.id);

    if (arg.enabled) reloadTask.enabled = arg.enabled;
    if (arg.taskSessionTimeout)
      reloadTask.taskSessionTimeout = arg.taskSessionTimeout;
    if (arg.maxRetries) reloadTask.maxRetries = arg.maxRetries;

    let updateCommon = new UpdateCommonProperties(this, reloadTask, arg);
    reloadTask = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`reloadtask/${arg.id}`, { ...reloadTask })
      .then((res) => res.data as ITask);
  }

  public async reloadRemove(id: string) {
    if (!id) throw new Error(`taskReloadRemove: id" parameter is required`);

    return await this.repoClient.Delete(`reloadtask/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async externalGetAll() {
    return await this.getFilter("taskType eq 2");
  }

  public async externalRemove(id: string) {
    if (!id) throw new Error(`taskExternalRemove: "id" parameter is required`);

    return await this.repoClient
      .Delete(`externalprogramtask/${id}`)
      .then((res) => {
        return { id, status: res.status } as IEntityRemove;
      });
  }

  public async create(arg: ITaskCreate) {
    if (!arg.appId)
      throw new Error(`taskCreate: "appId" parameter is required`);
    if (!arg.name) throw new Error(`taskCreate: "name" parameter is required`);

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

    let updateCommon = new UpdateCommonProperties(this, reloadTask, arg);
    reloadTask = await updateCommon.updateAll();

    reloadTask.task.customProperties = (reloadTask as any).customProperties;
    reloadTask.task.tags = (reloadTask as any).tags;

    delete (reloadTask as any).modifiedDate;
    delete (reloadTask as any).customProperties;
    delete (reloadTask as any).tags;

    return await this.repoClient
      .Post(`reloadtask/create`, { ...reloadTask })
      .then((res) => res.data as ITask);
  }

  public async start(id: string, wait: boolean = false) {
    if (!id) throw new Error(`taskStart: "id" parameter is required`);

    let url = `task/${id}/start`;
    if (wait) url += `/synchronous`;

    return await this.repoClient
      .Post(`${url}`, {})
      .then((res) => res.status as IHttpStatus);
  }

  public async startByName(name: string, wait: boolean = false) {
    if (!name) throw new Error(`taskStartByName: "path" parameter is required`);

    let url = `task/start`;
    if (wait) url += `/synchronous`;
    url += `?name=${name}`;

    return await this.repoClient
      .Post(`${url}`, {})
      .then((res) => res.status as IHttpStatus);
  }

  public async waitExecution(taskId: string, executionId?: string) {
    if (!taskId)
      throw new Error(`taskWaitExecution: "taskId" parameter is required`);
    let taskStatusCode = -1;
    let resultId: string;

    if (!executionId) {
      resultId = await this.getFilter(`id eq ${taskId}`).then((t) => {
        return t[0].operational.lastExecutionResult.id;
      });
    }

    if (executionId) {
      resultId = await this.repoClient
        .Get(`/executionSession/${executionId}`)
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

  public async scheduleRemove(id: string) {
    if (!id) throw new Error(`taskScheduleRemove: "id" parameter is required`);
    return await this.repoClient.Delete(`schemaevent/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async scheduleGet(id: string) {
    if (!id) throw new Error(`taskScheduleGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`schemaevent/${id}`)
      .then((res) => res.data as ISchemaEvent);
  }

  public async scheduleGetAll() {
    return await this.repoClient
      .Get(`schemaevent`)
      .then((res) => res.data as ISchemaEventCondensed[]);
  }

  public async triggerCreateComposite(arg: ITaskCreateTriggerComposite) {
    if (!arg.eventTaskId)
      throw new Error(
        `taskTriggerCreateComposite: "eventTaskId" parameter is required`
      );
    if (!arg.state)
      throw new Error(
        `taskTriggerCreateComposite: "state" parameter is required`
      );
    if (!arg.taskId)
      throw new Error(
        `taskTriggerCreateComposite: "taskId" parameter is required`
      );
    if (!arg.triggerName)
      throw new Error(
        `taskTriggerCreateComposite: "triggerName" parameter is required`
      );

    let ruleState = -1;
    if (arg.state == "fail") ruleState = 2;
    if (arg.state == "success") ruleState = 1;

    let updateObject = {
      compositeEvents: [
        {
          compositeRules: [
            {
              reloadTask: {
                id: `${arg.eventTaskId}`,
              },
              ruleState: ruleState,
            },
          ],
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

  public async triggerCreateSchema(arg: ITaskCreateTriggerSchema) {
    if (!arg.name)
      throw new Error(`taskTriggerCreateSchema: "name" parameter is required`);
    if (!arg.reloadTaskId)
      throw new Error(
        `taskTriggerCreateSchema: "reloadTaskId" parameter is required`
      );

    let currentTimeStamp = new Date();

    let schemaRepeatOpt = this.schemaRepeat(
      arg.repeat || "Daily",
      arg.repeatEvery || 1,
      arg.daysOfWeek || "Monday",
      arg.daysOfMonth || 1
    );

    const reloadTaskDetails = await this.getFilter(
      `id eq ${arg.reloadTaskId}`
    ).then((t) => t[0]);

    let createObj = {
      name: arg.name,
      timeZone: arg.timeZone || "UTC",
      daylightSavingTime: arg.daylightSavingTime ? 0 : 1,
      startDate: arg.startDate || currentTimeStamp.toISOString(),
      expirationDate: arg.expirationDate || "9999-01-01T00:00:00.000",
      schemaFilterDescription: [schemaRepeatOpt.schemaFilterDescr],
      incrementDescription: schemaRepeatOpt.incrementDescr,
      incrementOption: 1,
      reloadTask: "" || {},
      externalProgramTask: "" || {},
      userSyncTask: "",
      enabled: true,
    };

    if (reloadTaskDetails.taskType == 0)
      createObj.reloadTask = reloadTaskDetails;
    if (reloadTaskDetails.taskType == 1)
      createObj.externalProgramTask = reloadTaskDetails;

    return await this.repoClient
      .Post(`schemaevent`, { ...createObj })
      .then((res) => res.status as IHttpStatus);
  }

  public async scriptLogGet(reloadTaskId: string, fileReferenceId: string) {
    if (!reloadTaskId)
      throw new Error(`taskScriptLogGet: "reloadTaskId" parameter is required`);
    if (!fileReferenceId)
      throw new Error(
        `taskScriptLogGet: "fileReferenceId" parameter is required`
      );

    return await this.repoClient
      .Get(
        `/reloadtask/${reloadTaskId}/scriptlog?filereferenceid=${encodeURIComponent(
          fileReferenceId
        )}
    `
      )
      .then((res) => res.data as string);
  }

  public async scriptLogFileGet(
    reloadTaskId: string,
    executionResultId: string
  ) {
    if (!reloadTaskId)
      throw new Error(
        `taskScriptLogFileGet: "reloadTaskId" parameter is required`
      );
    if (!executionResultId)
      throw new Error(
        `taskScriptLogFileGet: "executionResultId" parameter is required`
      );

    return await this.repoClient
      .Get(
        `/reloadtask/${reloadTaskId}/scriptlog?executionresultid =${encodeURIComponent(
          executionResultId
        )}
  `
      )
      .then((res) => res.data as string);
  }

  private schemaRepeat(
    repeat: TRepeatOptions,
    repeatEvery: number,
    daysOfWeek: TDaysOfWeek,
    daysOfMonth: TDaysOfMonth
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

  private getWeekDayNumber(daysOfWeek: TDaysOfWeek): number {
    if (daysOfWeek == "Sunday") return 0;
    if (daysOfWeek == "Monday") return 1;
    if (daysOfWeek == "Tuesday") return 2;
    if (daysOfWeek == "Wednesday") return 3;
    if (daysOfWeek == "Thursday") return 4;
    if (daysOfWeek == "Friday") return 5;
    if (daysOfWeek == "Saturday") return 6;
  }
}
