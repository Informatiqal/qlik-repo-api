import { QlikRepositoryClient } from "./main";
import { URLBuild } from "./util/generic";

import { ISelection } from "./types/interfaces";
import { IServerNodeConfigurationCondensed } from "./Node";

export interface IServiceStatusCondensed {
  id?: string;
  privileges?: string[];
}

export interface IServiceStatus extends IServiceStatusCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  serviceType: number;
  serviceState: number;
  timestamp?: string;
  serverNodeConfiguration: IServerNodeConfigurationCondensed;
}

export interface IClassServiceStatus {
  count(id: string): Promise<number>;
  get(id: string): Promise<IServiceStatus>;
  getAll(): Promise<IServiceStatusCondensed[]>;
  getFilter(filter: string, full?: boolean): Promise<IServiceStatus[]>;
  select(filter?: string): Promise<ISelection>;
}

export class ServiceStatus implements IClassServiceStatus {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async count(): Promise<number> {
    return await this.repoClient
      .Get(`ServiceStatus/count`)
      .then((res) => res.data as number);
  }

  public async get(id: string) {
    if (!id) throw new Error(`serviceStatus.get: "id" parameter is required`);
    return await this.repoClient
      .Get(`ServiceStatus/${id}`)
      .then((res) => res.data as IServiceStatus);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`ServiceStatus`)
      .then((res) => res.data as IServiceStatusCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(
        `serviceStatus.getFilter: "filter" parameter is required`
      );

    return await this.repoClient
      .Get(`ServiceStatus/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IServiceStatus[]);
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/ServiceStatus`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
