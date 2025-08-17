import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { ISelection, IServiceCluster } from "./types/interfaces";
import { ServiceCluster } from "./ServiceCluster";
import { RemoveItemsResponse, SelectionEntity } from "./util/SelectionEntity";

export interface IClassServiceClusters {
  count(): Promise<number>;
  get(arg: { id: string }): Promise<ServiceCluster>;
  getAll(): Promise<ServiceCluster[]>;
  getFilter(arg: { filter: string }): Promise<ServiceCluster[]>;
  removeFilter(arg: { filter: string }): Promise<RemoveItemsResponse>;
  removeList(arg: { items: string[] }): Promise<RemoveItemsResponse>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class ServiceClusters implements IClassServiceClusters {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async count() {
    return await this.#repoClient
      .Get<number>(`ServiceCluster/count`)
      .then((res) => res.data);
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
      .Get<IServiceCluster[]>(`ServiceCluster/full`)
      .then((res) => res.data)
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
      .Get<IServiceCluster[]>(
        `ServiceCluster/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new ServiceCluster(this.#repoClient, t.id, t));
      });
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`serviceCluster.filter: "filter" parameter is required`);

    const selection = new SelectionEntity(this.#repoClient, "servicecluster");
    await selection.init({ filter: arg.filter });
    const removeStatus = await selection.removeAllItems();

    return removeStatus;
  }

  public async removeList(arg: { items: string[] }) {
    if (!arg.items)
      throw new Error(
        `serviceCluster.removeList: "items" parameter is required`
      );

    const selection = new SelectionEntity(this.#repoClient, "servicecluster");
    await selection.init({ items: arg.items });
    const removeStatus = await selection.removeAllItems();

    return removeStatus;
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/ServiceCluster`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }
}
