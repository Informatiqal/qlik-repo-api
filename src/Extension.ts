import { QlikRepositoryClient } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { URLBuild } from "./util/generic";

import { ICustomPropertyCondensed } from "./CustomProperty";
import { ITagCondensed } from "./Tag";

import {
  IHttpStatus,
  IEntityRemove,
  IFileExtensionWhiteListCondensed,
  IOwner,
  IStaticContentReferenceCondensed,
} from "./interfaces";

export interface IExtensionCondensed {
  id: string;
  privileges: string[];
  name: string;
}

export interface IExtension extends IExtensionCondensed {
  createdDate: string;
  modifiedDate: string;
  schemaPath: string;
  customProperties: ICustomPropertyCondensed[];
  owner: IOwner;
  tags: ITagCondensed[];
  whiteList: IFileExtensionWhiteListCondensed;
  references: IStaticContentReferenceCondensed[];
}

export interface IExtensionUpdate {
  id: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IExtensionImport {
  file: Buffer;
  password?: string;
}

export interface IClassExtension {
  get(id: string): Promise<IExtension>;
  getAll(): Promise<IExtensionCondensed[]>;
  getFilter(filter: string, full?: boolean): Promise<IExtensionCondensed[]>;
  import(arg: IExtensionImport): Promise<IExtension>;
  remove(id: string): Promise<IEntityRemove>;
  update(arg: IExtensionUpdate): Promise<IExtension>;
}

export class Extension implements IClassExtension {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`extensionGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`extension/${id}`)
      .then((res) => res.data as IExtension);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`extension`)
      .then((res) => res.data as IExtensionCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`extensionGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`extension?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IExtension[]);
  }

  public async remove(id: string) {
    if (!id) throw new Error(`extensionRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`extension/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async update(arg: IExtensionUpdate) {
    if (!arg.id) throw new Error(`extensionUpdate: "id" parameter is required`);

    let extension = await this.get(arg.id);

    let updateCommon = new UpdateCommonProperties(this, extension, arg);
    extension = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`extension/${arg.id}`, { ...extension })
      .then((res) => res.data as IExtension);
  }

  public async import(arg: IExtensionImport) {
    if (!arg.file)
      throw new Error(`extensionImport: "file" parameter is required`);

    const urlBuild = new URLBuild(`extension/upload`);
    if (arg.password) urlBuild.addParam("password", arg.password);

    return await this.repoClient
      .Post(urlBuild.getUrl(), arg.file)
      .then((res) => res.data as IExtension);
  }
}
