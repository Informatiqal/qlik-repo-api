import { QlikRepositoryClient } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IProxyServiceSettingsLogVerbosity } from "./Proxy.interface";
import { ICustomPropertyCondensed } from "./CustomProperty";
import { ITagCondensed } from "./Tag";
import { IServerNodeConfigurationCondensed } from "./Node";

export type TSchedulerServiceType = "Master" | "Slave" | "MasterAndSlave";

export interface ISchedulerServiceUpdate {
  id: string;
  schedulerServiceType?: TSchedulerServiceType;
  maxConcurrentEngines?: number;
  engineTimeout?: number;
  tags?: string[];
  customProperties?: string[];
}

export interface ISchedulerServiceCondensed {
  id?: string;
  privileges?: string[];
}

export interface ISchedulerServiceSettingsLogVerbosity
  extends IProxyServiceSettingsLogVerbosity {
  logVerbosityApplication?: number;
  logVerbosityTaskExecution?: number;
}

export interface ISchedulerServiceSettings {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  schedulerServiceType?: number;
  maxConcurrentEngines?: number;
  engineTimeout?: number;
  logVerbosity;
  SchedulerServiceSettingsLogVerbosity;
}

export interface ISchedulerService extends ISchedulerServiceCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  customProperties?: ICustomPropertyCondensed[];
  tags?: ITagCondensed[];
  serverNodeConfiguration: IServerNodeConfigurationCondensed;
  settings: ISchedulerServiceSettings;
}
export interface IClassScheduler {
  get(id: string): Promise<ISchedulerService>;
  getAll(): Promise<ISchedulerServiceCondensed[]>;
  getFilter(filter: string): Promise<ISchedulerService[]>;
  update(arg: ISchedulerServiceUpdate): Promise<ISchedulerService>;
}

export class Scheduler implements IClassScheduler {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`schedulerGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`schedulerservice/${id}`)
      .then((res) => res.data as ISchedulerService);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`schedulerservice`)
      .then((res) => res.data as ISchedulerServiceCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`schedulerGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`schedulerservice/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ISchedulerService[]);
  }

  public async update(arg: ISchedulerServiceUpdate) {
    if (!arg.id) throw new Error(`schedulerUpdate: "id" parameter is required`);

    let scheduler = await this.get(arg.id);

    if (arg.schedulerServiceType) {
      if (arg.schedulerServiceType == "Master")
        scheduler.settings.schedulerServiceType = 0;
      if (arg.schedulerServiceType == "Slave")
        scheduler.settings.schedulerServiceType = 1;
      if (arg.schedulerServiceType == "MasterAndSlave")
        scheduler.settings.schedulerServiceType = 2;
    }

    if (arg.maxConcurrentEngines) {
      if (arg.maxConcurrentEngines < 1 && arg.maxConcurrentEngines > 256)
        throw new Error(
          `schedulerUpdate: "maxConcurrentEngines" value must be between 1 and 256`
        );

      scheduler.settings.maxConcurrentEngines = arg.maxConcurrentEngines;
    }

    if (arg.engineTimeout) {
      if (arg.engineTimeout < 10 && arg.engineTimeout > 10080)
        throw new Error(
          `schedulerUpdate: "engineTimeout" value must be between 10 and 10080`
        );
      scheduler.settings.engineTimeout = arg.engineTimeout;
    }

    let updateCommon = new UpdateCommonProperties(this, scheduler, arg);
    scheduler = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`schedulerservice/${arg.id}`, scheduler)
      .then((res) => res.data as ISchedulerService);
  }
}
