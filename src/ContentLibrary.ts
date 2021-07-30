import getMime from "name2mime";
import { QlikGenericRestClient, QlikRepositoryClient } from "qlik-rest-api";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { GetCommonProperties } from "./util/GetCommonProps";
import { URLBuild } from "./util/generic";

import {
  IStaticContentReferenceCondensed,
  IEntityRemove,
  ISelection,
  IFileExtensionWhiteListCondensed,
} from "./types/interfaces";

import { ICustomPropertyValue } from "./CustomProperty";
import { ITagCondensed } from "./Tag";
import { IOwner } from "./User";

export interface IContentLibraryFile {
  name: string;
  file: string;
}

export interface IContentLibraryUpdate {
  id: string;
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

export interface IClassContentLibrary {
  get(id: string): Promise<IContentLibrary>;
  getAll(): Promise<IContentLibraryCondensed[]>;
  getFilter(filter: string, orderBy?: string): Promise<IContentLibrary[]>;
  export(name: string, sourceFileName?: string): Promise<IContentLibraryFile[]>;
  import(
    name: string,
    file: Buffer,
    arg?: {
      externalPath?: string;
      overwrite?: boolean;
    }
  ): Promise<IContentLibrary[]>;
  importForApp(
    appId: string,
    file: Buffer,
    arg?: {
      externalPath?: string;
      overwrite?: boolean;
    }
  ): Promise<IContentLibrary[]>;
  create(
    name: string,
    customProperties: string[],
    tags: string[],
    owner: string
  ): Promise<IContentLibrary>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter: string): Promise<ISelection>;
  update(arg: IContentLibraryUpdate): Promise<IContentLibrary>;
}

export class ContentLibrary implements IClassContentLibrary {
  private repoClient: QlikRepositoryClient;
  private genericClient: QlikGenericRestClient;
  constructor(
    private mainRepoClient: QlikRepositoryClient,
    private mainGenericClient: QlikGenericRestClient
  ) {
    this.repoClient = mainRepoClient;
    this.genericClient = mainGenericClient;
  }

  // TODO: test how GetCommonProperties behaves!
  public async create(
    name: string,
    customProperties = [],
    tags = [],
    owner = ""
  ) {
    if (!name)
      throw new Error(`contentLibrary.create: "name" parameter is required`);

    let getCommonProps = new GetCommonProperties(
      this.repoClient,
      customProperties,
      tags,
      owner
    );

    let commonProps = await getCommonProps.getAll();

    return await this.repoClient
      .Post(`contentlibrary`, { name, ...commonProps })
      .then((res) => res.data as IContentLibrary);
  }

  public async get(id: string) {
    if (!id) throw new Error(`contentLibrary.get: "id" parameter is required`);
    return await this.repoClient
      .Get(`contentlibrary/${id}`)
      .then((res) => res.data as IContentLibrary);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`contentlibrary`)
      .then((res) => res.data as IContentLibraryCondensed[]);
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
      .then((res) => res.data as IContentLibrary[]);
  }

  // TODO: need to be tested!
  public async export(name: string, sourceFileName?: string) {
    const library: IContentLibrary[] = await this.getFilter(
      `name eq '${name}'`
    );

    if (library.length == 0)
      throw new Error(`contentLibrary.export: library "${name}" do not exists`);
    if (library.length > 1)
      throw new Error(
        `contentLibrary.export: more than one library "${name}" found`
      );

    let files: IStaticContentReferenceCondensed[] = [];

    // if only one file have to be extracted
    if (sourceFileName) {
      files = library[0].references.filter((r) => {
        return r.logicalPath.replace(/^.*[\\\/]/, "") == sourceFileName;
      });
    }

    // if all the files from the library have to be extracted
    if (!sourceFileName) files = library[0].references;

    if (files.length == 0)
      throw new Error(
        `contentLibrary.export: No file(s) in content library "${name}"`
      );

    return await Promise.all<IContentLibraryFile>(
      files.map(async (f) => {
        let fileContent = await this.genericClient.Get(f.logicalPath);
        return {
          name: f.logicalPath.replace(/^.*[\\\/]/, ""),
          file: fileContent.data,
        };
      })
    );
  }

  // TODO: test + is externalPath required
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
      .then((res) => res.data as IContentLibrary[]);
  }

  // TODO: test + is externalPath required
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
      .then((res) => res.data as IContentLibrary[]);
  }

  public async remove(id: string) {
    if (!id)
      throw new Error(`contentLibrary.remove: "id" parameter is required`);

    return await this.repoClient.Delete(`contentlibrary/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `contentLibrary.removeFilter: "filter" parameter is required`
      );
    const contentLibraries = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      contentLibraries.map((contentLib: IContentLibrary) => {
        return this.remove(contentLib.id);
      })
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/contentlibrary`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  // REVIEW: verify the logic here
  public async update(arg: IContentLibraryUpdate): Promise<IContentLibrary> {
    if (!arg.id)
      throw new Error(`contentLibrary.update: "id" parameter is required`);

    let contentLibrary = await this.get(arg.id);

    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      contentLibrary,
      arg
    );
    contentLibrary = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`contentlibrary/${arg.id}`, { ...contentLibrary })
      .then((res) => res.data as IContentLibrary);
  }
}
