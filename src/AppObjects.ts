import { URLBuild } from "./util/generic";

import { ISelection, IAppObject } from "./types/interfaces";
import { AppObject } from "./AppObject";
import { QlikRepositoryClient } from "qlik-rest-api";
import { RemoveItemsResponse, SelectionEntity } from "./util/SelectionEntity";

export interface IClassAppObjects {
  get(arg: { id: string }): Promise<AppObject>;
  getAll(): Promise<AppObject[]>;
  getFilter(arg?: { filter: string }): Promise<AppObject[]>;
  removeFilter(arg?: { filter: string }): Promise<RemoveItemsResponse>;
  removeList(arg?: { items: string[] }): Promise<RemoveItemsResponse>;
  select(arg?: { filter: string }): Promise<ISelection>;
}
export class AppObjects implements IClassAppObjects {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    const appObject: AppObject = new AppObject(this.#repoClient, arg.id, null);
    await appObject.init();

    return appObject;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IAppObject[]>(`app/object/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => {
          return new AppObject(this.#repoClient, t.id, t);
        });
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`appObject.filter: "filter" parameter is required`);

    return await this.#repoClient
      .Get<IAppObject[]>(
        `app/object/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => {
          return new AppObject(this.#repoClient, t.id, t);
        });
      });
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`appObject.removeFilter: "filter" parameter is required`);

    const selection = new SelectionEntity(this.#repoClient, "app/object");
    await selection.init({ filter: arg.filter });
    const removeStatus = await selection.removeAllItems();

    return removeStatus;
  }

  public async removeList(arg: { items: string[] }) {
    if (!arg.items)
      throw new Error(`appObject.removeList: "items" parameter is required`);

    const selection = new SelectionEntity(this.#repoClient, "app/object");
    await selection.init({ items: arg.items });
    const removeStatus = await selection.removeAllItems();

    return removeStatus;
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/app/object`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }
}
