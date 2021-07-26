import { QlikRepoApi } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import {
  IHttpStatus,
  IAppObject,
  IAppObjectCondensed,
  IHttpReturnRemove,
} from "./interfaces";

import { IAppObjectUpdate } from "./interfaces/argument.interface";

export class AppObject {
  constructor() {}

  public async appObjectGet(
    this: QlikRepoApi,
    id: string
  ): Promise<IAppObject> {
    if (!id) throw new Error(`appObjectGet: "id" parameter is required`);

    return await this.repoClient
      .Get(`app/object/${id}`)
      .then((res) => res.data as IAppObject);
  }

  public async appObjectGetAll(
    this: QlikRepoApi
  ): Promise<IAppObjectCondensed[]> {
    return await this.repoClient
      .Get(`app/object`)
      .then((res) => res.data as IAppObjectCondensed[]);
  }

  public async appObjectGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IAppObject[]> {
    if (!filter)
      throw new Error(`appObjectFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`app/object/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IAppObject[]);
  }

  public async appObjectPublish(
    this: QlikRepoApi,
    id: string
  ): Promise<IAppObject[]> {
    if (!id) throw new Error(`appObjectPublish: "id" parameter is required`);

    return await this.repoClient
      .Put(`app/object/${id}/publish`, {})
      .then((res) => res.data as IAppObject[]);
  }

  public async appObjectUnPublish(
    this: QlikRepoApi,
    id: string
  ): Promise<IAppObject[]> {
    if (!id) throw new Error(`appObjectUnPublish: "id" parameter is required`);

    return await this.repoClient
      .Put(`app/object/${id}/unpublish`, {})
      .then((res) => res.data as IAppObject[]);
  }

  public async appObjectRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`appObjectRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`app/object/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async appObjectUpdate(
    this: QlikRepoApi,
    arg: IAppObjectUpdate
  ): Promise<IAppObject> {
    if (!arg.id) throw new Error(`appObjectUpdate: "id" parameter is required`);

    let appObject = await this.appObjectGet(arg.id);
    if (arg.approved) appObject.approved = arg.approved;

    let updateCommon = new UpdateCommonProperties(this, appObject, arg);
    appObject = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`app/object/${arg.id}`, { ...appObject })
      .then((res) => res.data as IAppObject);
  }
}
