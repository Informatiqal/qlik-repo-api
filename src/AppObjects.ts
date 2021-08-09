import { URLBuild } from "./util/generic";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { IAppCondensed } from "./Apps";
import { AppObject, IClassAppObject } from "./AppObject";
import { ITagCondensed } from "./Tags";
import { IUserCondensed } from "./Users";
import { QlikRepositoryClient } from "qlik-rest-api";

export interface IAppObjectCondensed {
  id?: string;
  privileges?: string[];
  name?: string;
  engineObjectId?: string;
  contentHash?: string;
  engineObjectType?: string;
  description?: string;
  objectType?: string;
  publishTime?: string;
  published?: boolean;
}

export interface IAppObject extends IAppObjectCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  owner: IUserCondensed;
  tags: ITagCondensed[];
  app: IAppCondensed;
  size?: number;
  attributes: string;
  approved?: boolean;
  sourceObject: string;
  draftObject: string;
  appObjectBlobId: string;
}

export interface IClassAppObjects {
  get(id: string): Promise<IClassAppObject>;
  getAll(): Promise<IClassAppObject[]>;
  getFilter(filter: string): Promise<IClassAppObject[]>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
}
export class AppObjects implements IClassAppObjects {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    const appObject: AppObject = new AppObject(this.repoClient, id, null);
    await appObject.init();

    return appObject;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`app/object/full`)
      .then((res) => res.data as IAppObject[])
      .then((data) => {
        return data.map((t) => {
          return new AppObject(this.repoClient, t.id, t);
        });
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`appObject.filter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`app/object/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IAppObject[])
      .then((data) => {
        return data.map((t) => {
          return new AppObject(this.repoClient, t.id, t);
        });
      });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(`appObject.removeFilter: "filter" parameter is required`);

    const appObjects = await this.getFilter(filter).then(
      (t: IClassAppObject[]) => {
        if (t.length == 0)
          throw new Error(
            `appObject.removeFilter: filter query return 0 items`
          );

        return t;
      }
    );
    return await Promise.all<IEntityRemove>(
      appObjects.map((appObject: IClassAppObject) => {
        return appObject.remove();
      })
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/app/object`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
