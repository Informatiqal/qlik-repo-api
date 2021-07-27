import { QlikRepositoryClient } from "qlik-rest-api";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IHttpStatus, IEntityRemove } from "./interfaces";
import { IAppCondensed } from "./App";
import { ITagCondensed } from "./Tag";
import { IUserCondensed } from "./User";

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
  unPublish(id: string): Promise<IAppObject[]>;
  update(arg: IAppObjectUpdate): Promise<IAppObject>;
}
export class AppObject implements IClassAppObject {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`appObjectGet: "id" parameter is required`);

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
      throw new Error(`appObjectFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`app/object/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IAppObject[]);
  }

  public async publish(id: string) {
    if (!id) throw new Error(`appObjectPublish: "id" parameter is required`);

    return await this.repoClient
      .Put(`app/object/${id}/publish`, {})
      .then((res) => res.data as IAppObject[]);
  }

  public async unPublish(id: string) {
    if (!id) throw new Error(`appObjectUnPublish: "id" parameter is required`);

    return await this.repoClient
      .Put(`app/object/${id}/unpublish`, {})
      .then((res) => res.data as IAppObject[]);
  }

  public async remove(id: string) {
    if (!id) throw new Error(`appObjectRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`app/object/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async update(arg: IAppObjectUpdate) {
    if (!arg.id) throw new Error(`appObjectUpdate: "id" parameter is required`);

    let appObject = await this.get(arg.id);
    if (arg.approved) appObject.approved = arg.approved;

    let updateCommon = new UpdateCommonProperties(this, appObject, arg);
    appObject = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`app/object/${arg.id}`, { ...appObject })
      .then((res) => res.data as IAppObject);
  }
}
