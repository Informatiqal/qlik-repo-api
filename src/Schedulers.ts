import { URLBuild } from "./util/generic";

import { ISelection } from "./types/interfaces";
import { IProxyServiceSettingsLogVerbosity } from "./Proxy.interface";
import { ICustomPropertyCondensed } from "./CustomProperties";
import { ITagCondensed } from "./Tags";
import { IServerNodeConfigurationCondensed } from "./Nodes";
import { QlikRepositoryClient } from "qlik-rest-api";
import { IClassScheduler, Scheduler } from "./Scheduler";

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

export interface IClassSchedulers {
  get(id: string): Promise<IClassScheduler>;
  getAll(): Promise<IClassScheduler[]>;
  getFilter(filter: string): Promise<IClassScheduler[]>;
  select(filter: string): Promise<ISelection>;
  // update(arg: ISchedulerServiceUpdate): Promise<ISchedulerService>;
}

export class Schedulers implements IClassSchedulers {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`scheduler.get: "id" parameter is required`);
    const scheduler: Scheduler = new Scheduler(this.repoClient, id);
    await scheduler.init();

    return scheduler;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`schedulerservice/full`)
      .then((res) => res.data as ISchedulerService[])
      .then((data) => {
        return data.map((t) => {
          return new Scheduler(this.repoClient, t.id, t);
        });
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`scheduler.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`schedulerservice/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ISchedulerService[])
      .then((data) => {
        return data.map((t) => {
          return new Scheduler(this.repoClient, t.id, t);
        });
      });
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/schedulerservice`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
