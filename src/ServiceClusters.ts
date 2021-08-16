import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { ISelection, IEntityRemove } from "./types/interfaces";
import { IServiceCluster } from "./ServiceCluster.interface";
import { IClassServiceCluster, ServiceCluster } from "./ServiceCluster";

export interface IClassServiceClusters {
  count(): Promise<number>;
  get(id: string): Promise<IClassServiceCluster>;
  getAll(): Promise<IClassServiceCluster[]>;
  getFilter(filter: string): Promise<IClassServiceCluster[]>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
}

export class ServiceClusters implements IClassServiceClusters {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async count() {
    return await this.repoClient
      .Get(`ServiceCluster/count`)
      .then((res) => res.data as number);
  }

  public async get(id: string) {
    if (!id) throw new Error(`serviceCluster.get: "id" parameter is required`);

    const sc: ServiceCluster = new ServiceCluster(this.repoClient, id);
    await sc.init();

    return sc;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`ServiceCluster/full`)
      .then((res) => res.data as IServiceCluster[])
      .then((data) => {
        return data.map((t) => new ServiceCluster(this.repoClient, t.id, t));
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(
        `serviceCluster.getFilter: "filter" parameter is required`
      );

    return await this.repoClient
      .Get(`ServiceCluster/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IServiceCluster[])
      .then((data) => {
        return data.map((t) => new ServiceCluster(this.repoClient, t.id, t));
      });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(`serviceCluster.filter: "filter" parameter is required`);

    const serviceClusters = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      serviceClusters.map((sc: IClassServiceCluster) =>
        sc.remove().then((s) => ({ id: sc.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/ServiceCluster`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
