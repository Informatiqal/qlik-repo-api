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
  get(id: string): Promise<IClassContentLibrary>;
  getAll(): Promise<IClassContentLibrary[]>;
  getFilter(filter: string, orderBy?: string): Promise<IClassContentLibrary[]>;
  import(
    name: string,
    file: Buffer,
    arg?: {
      externalPath?: string;
      overwrite?: boolean;
    }
  ): Promise<IClassContentLibrary>;
  importForApp(
    appId: string,
    file: Buffer,
    arg?: {
      externalPath?: string;
      overwrite?: boolean;
    }
  ): Promise<IClassContentLibrary>;
  create(arg: IContentLibraryCreate): Promise<IClassContentLibrary>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter: string): Promise<ISelection>;
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
      .then((t) => new ContentLibrary(this.repoClient, t.id, t));
  }

  public async get(id: string) {
    if (!id)
      throw new Error(`contentLibraries.get: "id" parameter is required`);
    const cl: ContentLibrary = new ContentLibrary(
      this.repoClient,
      id,
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
          return new ContentLibrary(this.repoClient, t.id, t);
        });
      });
  }

  public async getFilter(filter: string, orderBy?: string) {
    if (!filter)
      throw new Error(
        `contentLibrary.getFilter: "filter" parameter is required`
      );

    const urlBuild = new URLBuild(`contentlibrary/full`);
    urlBuild.addParam("filter", filter);
    urlBuild.addParam("orderby", orderBy);

    return await this.repoClient
      .Get(urlBuild.getUrl())
      .then((res) => res.data as IContentLibrary[])
      .then((data) => {
        return data.map((t) => {
          return new ContentLibrary(this.repoClient, t.id, t);
        });
      });
  }

  public async import(
    name: string,
    file: Buffer,
    arg?: {
      externalPath?: string;
      overwrite?: boolean;
    }
  ) {
    if (!name)
      throw new Error(`contentLibrary.import: "name" parameter is required`);
    if (!file)
      throw new Error(`contentLibrary.import: "file" parameter is required`);

    const urlBuild = new URLBuild(`contentlibrary/${name}/uploadfile`);
    urlBuild.addParam("externalpath", arg.externalPath || undefined);
    urlBuild.addParam("overwrite", arg.overwrite || undefined);

    const mimeType = getMime(file);
    return await this.repoClient
      .Put(urlBuild.getUrl(), {}, mimeType)
      .then((res) => {
        return new ContentLibrary(
          this.repoClient,
          (res.data as IContentLibrary).id,
          res.data as IContentLibrary
        );
      });
  }

  public async importForApp(
    appId: string,
    file: Buffer,
    arg?: {
      externalPath?: string;
      overwrite?: boolean;
    }
  ) {
    if (!appId)
      throw new Error(`contentLibrary.import: "name" parameter is required`);
    if (!file)
      throw new Error(`contentLibrary.import: "file" parameter is required`);

    const urlBuild = new URLBuild(`appcontent/${appId}/uploadfile`);
    urlBuild.addParam("externalpath", arg.externalPath || undefined);
    urlBuild.addParam("overwrite", arg.overwrite || undefined);

    const mimeType = getMime(file);
    return await this.repoClient
      .Put(urlBuild.getUrl(), {}, mimeType)
      .then((res) => res.data as IContentLibrary)
      .then((a) => new ContentLibrary(this.repoClient, a.id, a));
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `contentLibrary.removeFilter: "filter" parameter is required`
      );
    const contentLibraries = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      contentLibraries.map((contentLib: IClassContentLibrary) =>
        contentLib
          .remove()
          .then((s) => ({ id: contentLib.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/contentlibrary`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
