import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { ISelection } from "./types/interfaces";
import { Extension, IClassExtension } from "./Extension";
import { ICustomPropertyCondensed } from "./CustomProperties";
import { ITagCondensed } from "./Tags";

import {
  IEntityRemove,
  IFileExtensionWhiteListCondensed,
  IStaticContentReferenceCondensed,
} from "./types/interfaces";
import { IOwner } from "./Users";

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
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IExtensionImport {
  file: Buffer;
  password?: string;
}

export interface IClassExtensions {
  get(id: string): Promise<IClassExtension>;
  getAll(): Promise<IClassExtension[]>;
  getFilter(filter: string, full?: boolean): Promise<IClassExtension[]>;
  import(arg: IExtensionImport): Promise<IClassExtension>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
}

export class Extensions implements IClassExtensions {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`extension.get: "id" parameter is required`);
    const extension: Extension = new Extension(this.repoClient, id, null);
    await extension.init();

    return extension;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`extension/full`)
      .then((res) => res.data as IExtension[])
      .then((data) => {
        return data.map((t) => new Extension(this.repoClient, t.id, t));
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`extension.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`extension?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IExtension[])
      .then((data) => {
        return data.map((t) => new Extension(this.repoClient, t.id, t));
      });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `extensions.removeFilter: "filter" parameter is required`
      );

    const extensions = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      extensions.map((extension: IClassExtension) =>
        extension
          .remove()
          .then((s) => ({ id: extension.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/extension`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async import(arg: IExtensionImport) {
    if (!arg.file)
      throw new Error(`extension.import: "file" parameter is required`);

    const urlBuild = new URLBuild(`extension/upload`);
    if (arg.password) urlBuild.addParam("password", arg.password);

    return await this.repoClient
      .Post(urlBuild.getUrl(), arg.file)
      .then(
        (res) => new Extension(this.repoClient, (res.data as IExtension).id)
      );
  }
}
