import { QlikRepoApi } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IHttpStatus, ITask, ITaskExecutionResult } from "./interfaces";
import {
  ITaskCreate,
  IStreamUpdate,
  ITaskCreateTriggerComposite,
  ITaskCreateTriggerSchema,
} from "./interfaces/argument.interface";

import { TRepeatOptions, TDaysOfMonth, TDaysOfWeek } from "./interfaces/ranges";

export class Task {
  constructor() {}

  public async taskGetAll(this: QlikRepoApi): Promise<any> {
    return await this.repoClient
      .Get(`task/full`)
      .then((res) => res.data as any);
  }

  public async taskReloadGetAll(this: QlikRepoApi): Promise<any> {
    return await this.taskGetFilter("taskType eq 0");
  }

  public async taskExternalGetAll(this: QlikRepoApi): Promise<any> {
    return await this.taskGetFilter("taskType eq 2");
  }

  public async taskReloadGet(this: QlikRepoApi, id: string): Promise<ITask> {
    return await this.repoClient
      .Get(`reloadtask/${id}`)
      .then((res) => res.data as ITask);
  }

  public async taskGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<ITask[]> {
    return await this.repoClient
      .Get(`task/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITask[]);
  }

  public async taskReloadGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<ITask[]> {
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
  ): Promise<IHttpStatus> {
    return await this.repoClient
      .Delete(`reloadtask/${id}`)
      .then((res) => res.status as IHttpStatus);
  }

  public async taskExternalRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpStatus> {
    return await this.repoClient
      .Delete(`externalprogramtask/${id}`)
      .then((res) => res.status as IHttpStatus);
  }

  public async taskCreate(this: QlikRepoApi, arg: ITaskCreate): Promise<ITask> {
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

  public async taskUpdate(
    this: QlikRepoApi,
    arg: IStreamUpdate
  ): Promise<ITask> {
    let stream = await this.streamGet(arg.id);

    if (arg.name) stream.name = arg.name;

    let updateCommon = new UpdateCommonProperties(this, stream, arg);
    stream = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`stream/${arg.id}`, { ...stream })
      .then((res) => res.data as ITask);
  }

  public async taskStart(
    this: QlikRepoApi,
    id: string,
    wait: boolean = false
  ): Promise<IHttpStatus> {
    let url = `task/${id}/start`;
    if (wait) url += `/synchronous`;

    return await this.repoClient
      .Post(`${url}`, {})
      .then((res) => res.status as IHttpStatus);
  }

  public async taskStartByName(
    this: QlikRepoApi,
    taskName: string,
    wait: boolean = false
  ): Promise<IHttpStatus> {
    let url = `task/start`;
    if (wait) url += `/synchronous`;
    url += `?name=${taskName}`;

    return await this.repoClient
      .Post(`${url}`, {})
      .then((res) => res.status as IHttpStatus);
  }

  public async taskWaitExecution(
    this: QlikRepoApi,
    taskId: string,
    executionId?: string
  ): Promise<ITaskExecutionResult> {
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
  ): Promise<IHttpStatus> {
    return await this.repoClient
      .Delete(`schemaevent/${id}`)
      .then((res) => res.status as IHttpStatus);
  }

  public async taskScheduleGet(
    this: QlikRepoApi,
    name: string,
    reloadTaskId: string
  ): Promise<IHttpStatus> {
    let filter = `id eq ${reloadTaskId}`;
    let nameFilter = `name eq '${name}'`;

    return await this.repoClient
      .Delete(`schemaevent`)
      .then((res) => res.status as IHttpStatus);
  }

  public async taskTriggerCreateComposite(
    this: QlikRepoApi,
    arg: ITaskCreateTriggerComposite
  ): Promise<IHttpStatus> {
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
    reloadTaskId: string
  ): Promise<boolean> {
    return true;
  }

  public async taskScriptLogFileGet(
    this: QlikRepoApi,
    reloadTaskId: string
  ): Promise<boolean> {
    return true;
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

// get /reloadtask/{reloadtaskid}/scriptlog
// get /reloadtask/{reloadtaskid}/scriptlogfile
