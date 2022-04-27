import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { ISelection, IEntityRemove, IServiceCluster } from "./types/interfaces";
import { IClassServiceCluster, ServiceCluster } from "./ServiceCluster";

export interface IClassServiceClusters {
  count(): Promise<number>;
  get(arg: { id: string }): Promise<IClassServiceCluster>;
  getAll(): Promise<IClassServiceCluster[]>;
  getFilter(arg: { filter: string }): Promise<IClassServiceCluster[]>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class ServiceClusters implements IClassServiceClusters {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async count() {
    return await this.#repoClient
      .Get(`ServiceCluster/count`)
      .then((res) => res.data as number);
  }

  public async get(arg: { id: string }) {
    if (!arg.id)
      throw new Error(`serviceCluster.get: "id" parameter is required`);

    const sc: ServiceCluster = new ServiceCluster(this.#repoClient, arg.id);
    await sc.init();

    return sc;
  }

  public async getAll() {
    return await this.#repoClient
      .Get(`ServiceCluster/full`)
      .then((res) => res.data as IServiceCluster[])
      .then((data) => {
        return data.map((t) => new ServiceCluster(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `serviceCluster.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get(`ServiceCluster/full?filter=(${encodeURIComponent(arg.filter)})`)
      .then((res) => res.data as IServiceCluster[])
      .then((data) => {
        return data.map((t) => new ServiceCluster(this.#repoClient, t.id, t));
      });
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`serviceCluster.filter: "filter" parameter is required`);

    const serviceClusters = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      serviceClusters.map((sc: IClassServiceCluster) =>
        sc.remove().then((s) => ({ id: sc.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/ServiceCluster`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
