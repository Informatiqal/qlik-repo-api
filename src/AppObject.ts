import { URLBuild } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { IAppCondensed } from "./App";
import { ITagCondensed } from "./Tag";
import { IUserCondensed } from "./User";
import { QlikRepositoryClient } from "./main";

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

export interface IAppObjectUpdate {
  id: string;
  owner?: string;
  approved?: boolean;
}

export interface IClassAppObject {
  get(id: string): Promise<IAppObject>;
  getAll(): Promise<IAppObjectCondensed[]>;
  getFilter(filter: string): Promise<IAppObject[]>;
  publish(id: string): Promise<IAppObject[]>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  unPublish(id: string): Promise<IAppObject[]>;
  update(arg: IAppObjectUpdate): Promise<IAppObject>;
}
export class AppObject implements IClassAppObject {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`appObject.Get: "id" parameter is required`);

    return await this.repoClient
      .Get(`app/object/${id}`)
      .then((res) => res.data as IAppObject);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`app/object`)
      .then((res) => res.data as IAppObjectCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`appObject.filter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`app/object/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IAppObject[]);
  }

  public async publish(id: string) {
    if (!id) throw new Error(`appObject.publish: "id" parameter is required`);

    return await this.repoClient
      .Put(`app/object/${id}/publish`, {})
      .then((res) => res.data as IAppObject[]);
  }

  public async unPublish(id: string) {
    if (!id) throw new Error(`appObject.unPublish: "id" parameter is required`);

    return await this.repoClient
      .Put(`app/object/${id}/unpublish`, {})
      .then((res) => res.data as IAppObject[]);
  }

  public async remove(id: string) {
    if (!id) throw new Error(`appObject.remove: "id" parameter is required`);

    return await this.repoClient.Delete(`app/object/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(`appObject.removeFilter: "filter" parameter is required`);

    const appObjects = await this.getFilter(filter).then((t: IAppObject[]) => {
      if (t.length == 0)
        throw new Error(`appObject.removeFilter: filter query return 0 items`);

      return t;
    });
    return await Promise.all<IEntityRemove>(
      appObjects.map((tag: IAppObject) => {
        return this.remove(tag.id);
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

  public async update(arg: IAppObjectUpdate) {
    if (!arg.id)
      throw new Error(`appObject.update: "id" parameter is required`);

    let appObject = await this.get(arg.id);
    if (arg.approved) appObject.approved = arg.approved;

    let updateCommon = new UpdateCommonProperties(this, appObject, arg);
    appObject = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`app/object/${arg.id}`, { ...appObject })
      .then((res) => res.data as IAppObject);
  }
}
