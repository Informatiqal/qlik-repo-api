import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { ISelection } from "./types/interfaces";
import { IServiceStatus, IServiceStatusCondensed } from "./types/interfaces";

export interface IClassServiceStatus {
  count(arg: { id: string }): Promise<number>;
  get(arg: { id: string }): Promise<IServiceStatus>;
  getAll(): Promise<IServiceStatusCondensed[]>;
  getFilter(arg: { filter: string; full?: boolean }): Promise<IServiceStatus[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class ServiceStatus implements IClassServiceStatus {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async count(): Promise<number> {
    return await this.#repoClient
      .Get(`ServiceStatus/count`)
      .then((res) => res.data as number);
  }

  public async get(arg: { id: string }) {
    if (!arg.id)
      throw new Error(`serviceStatus.get: "id" parameter is required`);
    return await this.#repoClient
      .Get(`ServiceStatus/${arg.id}`)
      .then((res) => res.data as IServiceStatus);
  }

  public async getAll() {
    return await this.#repoClient
      .Get(`ServiceStatus/full`)
      .then((res) => res.data as IServiceStatusCondensed[]);
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `serviceStatus.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get(`ServiceStatus/full?filter=(${encodeURIComponent(arg.filter)})`)
      .then((res) => res.data as IServiceStatus[]);
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/ServiceStatus`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
