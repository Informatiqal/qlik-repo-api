import { QlikRepoApi } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import {
  IHttpStatus,
  ITask,
  ITaskCondensed,
  ITaskExecutionResult,
  ISchemaEvent,
  ISchemaEventCondensed,
  IHttpReturnRemove,
} from "./interfaces";
import {
  ITaskCreate,
  ITaskReloadUpdate,
  ITaskCreateTriggerComposite,
  ITaskCreateTriggerSchema,
} from "./interfaces/argument.interface";

import { TRepeatOptions, TDaysOfMonth, TDaysOfWeek } from "./interfaces/ranges";

export class Task {
  constructor() {}

  public async taskGetAll(this: QlikRepoApi): Promise<ITaskCondensed[]> {
    return await this.repoClient
      .Get(`task`)
      .then((res) => res.data as ITaskCondensed[]);
  }

  public async taskReloadGetAll(this: QlikRepoApi): Promise<ITask[]> {
    return await this.taskGetFilter("taskType eq 0");
  }

  public async taskExternalGetAll(this: QlikRepoApi): Promise<ITask[]> {
    return await this.taskGetFilter("taskType eq 2");
  }

  public async taskReloadGet(this: QlikRepoApi, id: string): Promise<ITask> {
    if (!id) throw new Error(`taskReloadGet: "id" parameter is required`);

    return await this.repoClient
      .Get(`reloadtask/${id}`)
      .then((res) => res.data as ITask);
  }

  public async taskGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<ITask[]> {
    if (!filter) throw new Error(`taskGetFilter: "path" parameter is required`);

    return await this.repoClient
      .Get(`task/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITask[]);
  }

  public async taskReloadGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<ITask[]> {
    if (!filter)
      throw new Error(`taskReloadGetFilter: "path" parameter is required`);

    return await this.repoClient
      .Get(`reloadtask/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITask[]);
  }

  public async taskReloadCount(
    this: QlikRepoApi,
    filter?: string
  ): Promise<number> {
    let url: string = `reloadtask/count`;
    if (filter) url += `${url}?filter=(${encodeURIComponent(filter)})`;

    return await this.repoClient
      .Get(`${url}`)
      .then((res) => res.data.value as number);
  }

  public async taskReloadRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`taskReloadRemove: id" parameter is required`);

    return await this.repoClient.Delete(`reloadtask/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async taskExternalRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`taskExternalRemove: "id" parameter is required`);

    return await this.repoClient
      .Delete(`externalprogramtask/${id}`)
      .then((res) => {
        return { id, status: res.status as IHttpStatus };
      });
  }

  public async taskCreate(this: QlikRepoApi, arg: ITaskCreate): Promise<ITask> {
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

  public async taskReloadUpdate(
    this: QlikRepoApi,
    arg: ITaskReloadUpdate
  ): Promise<ITask> {
    if (!arg.id) throw new Error(`taskUpdate: "id" parameter is required`);

    let reloadTask: ITask = await this.taskReloadGet(arg.id);

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

  public async taskStart(
    this: QlikRepoApi,
    id: string,
    wait: boolean = false
  ): Promise<IHttpStatus> {
    if (!id) throw new Error(`taskStart: "id" parameter is required`);

    let url = `task/${id}/start`;
    if (wait) url += `/synchronous`;

    return await this.repoClient
      .Post(`${url}`, {})
      .then((res) => res.status as IHttpStatus);
  }

  public async taskStartByName(
    this: QlikRepoApi,
    name: string,
    wait: boolean = false
  ): Promise<IHttpStatus> {
    if (!name) throw new Error(`taskStartByName: "path" parameter is required`);

    let url = `task/start`;
    if (wait) url += `/synchronous`;
    url += `?name=${name}`;

    return await this.repoClient
      .Post(`${url}`, {})
      .then((res) => res.status as IHttpStatus);
  }

  public async taskWaitExecution(
    this: QlikRepoApi,
    taskId: string,
    executionId?: string
  ): Promise<ITaskExecutionResult> {
    if (!taskId)
      throw new Error(`taskWaitExecution: "taskId" parameter is required`);
    let taskStatusCode = -1;
    let resultId: string;

    if (!executionId) {
      resultId = await this.taskGetFilter(`id eq ${taskId}`).then((t) => {
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

  public async taskScheduleRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`taskScheduleRemove: "id" parameter is required`);
    return await this.repoClient.Delete(`schemaevent/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async taskScheduleGet(
    this: QlikRepoApi,
    id: string
  ): Promise<ISchemaEvent> {
    if (!id) throw new Error(`taskScheduleGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`schemaevent/${id}`)
      .then((res) => res.data as ISchemaEvent);
  }

  public async taskScheduleGetAll(
    this: QlikRepoApi
  ): Promise<ISchemaEventCondensed[]> {
    return await this.repoClient
      .Get(`schemaevent`)
      .then((res) => res.data as ISchemaEventCondensed[]);
  }

  public async taskTriggerCreateComposite(
    this: QlikRepoApi,
    arg: ITaskCreateTriggerComposite
  ): Promise<IHttpStatus> {
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

  public async taskTriggerCreateSchema(
    this: QlikRepoApi,
    arg: ITaskCreateTriggerSchema
  ) {
    if (!arg.name)
      throw new Error(`taskTriggerCreateSchema: "name" parameter is required`);
    if (!arg.reloadTaskId)
      throw new Error(
        `taskTriggerCreateSchema: "reloadTaskId" parameter is required`
      );

    let currentTimeStamp = new Date();

    let schemaRepeatOpt = schemaRepeat(
      arg.repeat || "Daily",
      arg.repeatEvery || 1,
      arg.daysOfWeek || "Monday",
      arg.daysOfMonth || 1
    );

    const reloadTaskDetails = await this.taskGetFilter(
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

  public async taskScriptLogGet(
    this: QlikRepoApi,
    reloadTaskId: string,
    fileReferenceId: string
  ): Promise<string> {
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

  public async taskScriptLogFileGet(
    this: QlikRepoApi,
    reloadTaskId: string,
    executionResultId: string
  ): Promise<string> {
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
}

function schemaRepeat(
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
    let weekDay = getWeekDayNumber(daysOfWeek);
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

function getWeekDayNumber(daysOfWeek: TDaysOfWeek): number {
  if (daysOfWeek == "Sunday") return 0;
  if (daysOfWeek == "Monday") return 1;
  if (daysOfWeek == "Tuesday") return 2;
  if (daysOfWeek == "Wednesday") return 3;
  if (daysOfWeek == "Thursday") return 4;
  if (daysOfWeek == "Friday") return 5;
  if (daysOfWeek == "Saturday") return 6;
}
