import { URLBuild } from "./util/generic";

import { IEntityRemove, ISelection, IAppObject } from "./types/interfaces";
import { AppObject, IClassAppObject } from "./AppObject";
import { QlikRepositoryClient } from "qlik-rest-api";

export interface IClassAppObjects {
  get(arg: { id: string }): Promise<IClassAppObject>;
  getAll(): Promise<IClassAppObject[]>;
  getFilter(arg?: { filter: string }): Promise<IClassAppObject[]>;
  removeFilter(arg?: { filter: string }): Promise<IEntityRemove[]>;
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
      .Get(`app/object/full`)
      .then((res) => res.data as IAppObject[])
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
      .Get(`app/object/full?filter=(${encodeURIComponent(arg.filter)})`)
      .then((res) => res.data as IAppObject[])
      .then((data) => {
        return data.map((t) => {
          return new AppObject(this.#repoClient, t.id, t);
        });
      });
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`appObject.removeFilter: "filter" parameter is required`);

    const appObjects = await this.getFilter({ filter: arg.filter }).then(
      (t: IClassAppObject[]) => {
        if (t.length == 0)
          throw new Error(
            `appObject.removeFilter: filter query return 0 items`
          );

        return t;
      }
    );
    return await Promise.all<IEntityRemove>(
      appObjects.map((appObject: IClassAppObject) =>
        appObject
          .remove()
          .then((s) => ({ id: appObject.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/app/object`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
