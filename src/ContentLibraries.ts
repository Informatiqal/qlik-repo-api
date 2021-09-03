//@ts-ignore
import getMime from "name2mime";
import { QlikGenericRestClient, QlikRepositoryClient } from "qlik-rest-api";
import { GetCommonProperties } from "./util/GetCommonProps";
import { URLBuild } from "./util/generic";

import {
  IStaticContentReferenceCondensed,
  IEntityRemove,
  ISelection,
  IFileExtensionWhiteListCondensed,
} from "./types/interfaces";

import { ContentLibrary, IClassContentLibrary } from "./ContentLibrary";
import { ICustomPropertyValue } from "./CustomProperties";
import { ITagCondensed } from "./Tags";
import { IOwner } from "./Users";

export interface IContentLibraryFile {
  name: string;
  file: string;
}

export interface IContentLibraryUpdate {
  name?: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IContentLibraryCondensed {
  privileges: string[];
  name: string;
  id: string;
  type: string;
}

export interface IContentLibrary extends IContentLibraryCondensed {
  createdDate: string;
  modifiedDate: string;
  schemaPath: string;
  customProperties: ICustomPropertyValue[];
  owner: IOwner;
  tags: ITagCondensed[];
  whiteList: IFileExtensionWhiteListCondensed;
  references: IStaticContentReferenceCondensed[];
}

export interface IContentLibraryCreate {
  name: string;
  customProperties?: string[];
  tags?: string[];
  owner?: string;
}

export interface IClassContentLibraries {
  get(arg: { id: string }): Promise<IClassContentLibrary>;
  getAll(): Promise<IClassContentLibrary[]>;
  getFilter(arg: {
    filter: string;
    orderBy?: string;
  }): Promise<IClassContentLibrary[]>;
  import(arg: {
    name: string;
    file: Buffer;
    externalPath?: string;
    overwrite?: boolean;
  }): Promise<IClassContentLibrary>;
  importForApp(arg: {
    appId: string;
    file: Buffer;
    externalPath?: string;
    overwrite?: boolean;
  }): Promise<IClassContentLibrary>;
  create(arg: IContentLibraryCreate): Promise<IClassContentLibrary>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class ContentLibraries implements IClassContentLibraries {
  private repoClient: QlikRepositoryClient;
  private genericClient: QlikGenericRestClient;
  constructor(
    private mainRepoClient: QlikRepositoryClient,
    private mainGenericClient: QlikGenericRestClient
  ) {
    this.repoClient = mainRepoClient;
    this.genericClient = mainGenericClient;
  }

  public async create(arg: IContentLibraryCreate) {
    if (!arg.name)
      throw new Error(`contentLibrary.create: "name" parameter is required`);

    let getCommonProps = new GetCommonProperties(
      this.repoClient,
      arg.customProperties || [],
      arg.tags || [],
      arg.owner || ""
    );

    let commonProps = await getCommonProps.getAll();

    return await this.repoClient
      .Post(`contentlibrary`, { name: arg.name, ...commonProps })
      .then((res) => res.data as IContentLibrary)
      .then(
        (t) => new ContentLibrary(this.repoClient, t.id, t, this.genericClient)
      );
  }

  public async get(arg: { id: string }) {
    if (!arg.id)
      throw new Error(`contentLibraries.get: "id" parameter is required`);
    const cl: ContentLibrary = new ContentLibrary(
      this.repoClient,
      arg.id,
      null,
      this.genericClient
    );
    await cl.init();

    return cl;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`contentlibrary/full`)
      .then((res) => res.data as IContentLibrary[])
      .then((data) => {
        return data.map((t) => {
          return new ContentLibrary(
            this.repoClient,
            t.id,
            t,
            this.genericClient
          );
        });
      });
  }

  public async getFilter(arg: { filter: string; orderBy?: string }) {
    if (!arg.filter)
      throw new Error(
        `contentLibrary.getFilter: "filter" parameter is required`
      );

    const urlBuild = new URLBuild(`contentlibrary/full`);
    urlBuild.addParam("filter", arg.filter);
    urlBuild.addParam("orderby", arg.orderBy);

    return await this.repoClient
      .Get(urlBuild.getUrl())
      .then((res) => res.data as IContentLibrary[])
      .then((data) => {
        return data.map((t) => {
          return new ContentLibrary(
            this.repoClient,
            t.id,
            t,
            this.genericClient
          );
        });
      });
  }

  public async import(arg: {
    name: string;
    file: Buffer;
    externalPath?: string;
    overwrite?: boolean;
  }) {
    if (!arg.name)
      throw new Error(`contentLibrary.import: "name" parameter is required`);
    if (!arg.file)
      throw new Error(`contentLibrary.import: "file" parameter is required`);

    const urlBuild = new URLBuild(`contentlibrary/${arg.name}/uploadfile`);
    urlBuild.addParam("externalpath", arg.externalPath || undefined);
    urlBuild.addParam("overwrite", arg.overwrite || undefined);

    const mimeType = getMime(arg.file);
    return await this.repoClient
      .Put(urlBuild.getUrl(), {}, mimeType)
      .then((res) => {
        return new ContentLibrary(
          this.repoClient,
          (res.data as IContentLibrary).id,
          res.data as IContentLibrary,
          this.genericClient
        );
      });
  }

  public async importForApp(arg: {
    appId: string;
    file: Buffer;
    externalPath?: string;
    overwrite?: boolean;
  }) {
    if (!arg.appId)
      throw new Error(`contentLibrary.import: "name" parameter is required`);
    if (!arg.file)
      throw new Error(`contentLibrary.import: "file" parameter is required`);

    const urlBuild = new URLBuild(`appcontent/${arg.appId}/uploadfile`);
    urlBuild.addParam("externalpath", arg.externalPath || undefined);
    urlBuild.addParam("overwrite", arg.overwrite || undefined);

    const mimeType = getMime(arg.file);
    return await this.repoClient
      .Put(urlBuild.getUrl(), {}, mimeType)
      .then((res) => res.data as IContentLibrary)
      .then(
        (a) => new ContentLibrary(this.repoClient, a.id, a, this.genericClient)
      );
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `contentLibrary.removeFilter: "filter" parameter is required`
      );
    const contentLibraries = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      contentLibraries.map((contentLib: IClassContentLibrary) =>
        contentLib
          .remove()
          .then((s) => ({ id: contentLib.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/contentlibrary`);
    urlBuild.addParam("filter", arg.filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
