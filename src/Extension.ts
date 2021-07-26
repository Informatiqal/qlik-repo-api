import { QlikRepoApi } from "./main";
import { URLBuild } from "./util/generic";

import {
  IHttpStatus,
  IExtension,
  IExtensionCondensed,
  IHttpReturnRemove,
} from "./interfaces";
import {
  IExtensionUpdate,
  IExtensionImport,
} from "./interfaces/argument.interface";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export class Extension {
  constructor() {}

  public async extensionGet(
    this: QlikRepoApi,
    id: string
  ): Promise<IExtension> {
    if (!id) throw new Error(`extensionGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`extension/${id}`)
      .then((res) => res.data as IExtension);
  }

  public async extensionGetAll(
    this: QlikRepoApi
  ): Promise<IExtensionCondensed[]> {
    return await this.repoClient
      .Get(`extension`)
      .then((res) => res.data as IExtensionCondensed[]);
  }

  public async extensionGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IExtensionCondensed[]> {
    if (!filter)
      throw new Error(`extensionGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`extension?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IExtension[]);
  }

  public async extensionRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`extensionRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`extension/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async extensionUpdate(
    this: QlikRepoApi,
    arg: IExtensionUpdate
  ): Promise<IExtension> {
    if (!arg.id) throw new Error(`extensionUpdate: "id" parameter is required`);

    let extension = await this.extensionGet(arg.id);

    let updateCommon = new UpdateCommonProperties(this, extension, arg);
    extension = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`extension/${arg.id}`, { ...extension })
      .then((res) => res.data as IExtension);
  }

  public async extensionImport(
    this: QlikRepoApi,
    arg: IExtensionImport
  ): Promise<IExtension[]> {
    if (!arg.file)
      throw new Error(`extensionImport: "file" parameter is required`);

    const urlBuild = new URLBuild(`extension/upload`);
    if (arg.password) urlBuild.addParam("password", arg.password);

    return await this.repoClient
      .Post(urlBuild.getUrl(), arg.file)
      .then((res) => res.data as IExtension[]);
  }
}
