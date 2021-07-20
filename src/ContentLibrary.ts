import getMime from "name2mime";
import { QlikRepoApi } from "./main";

import {
  IHttpStatus,
  IContentLibrary,
  IContentLibraryCondensed,
  IStaticContentReferenceCondensed,
  IContentLibraryFile,
  IHttpReturnRemove,
  IRemoveFilter,
  ISelection,
  IHttpReturn,
} from "./interfaces";
import { IContentLibraryUpdate } from "./interfaces/argument.interface";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { GetCommonProperties } from "./util/GetCommonProps";
import { URLBuild } from "./util/generic";

export class ContentLibrary {
  constructor() {}

  // TODO: test how GetCommonProperties behaves!
  public async contentLibraryCreate(
    this: QlikRepoApi,
    name: string,
    customProperties = [],
    tags = [],
    owner = ""
  ): Promise<IContentLibrary> {
    if (!name)
      throw new Error(`contentLibraryCreate: "name" parameter is required`);

    let getCommonProps = new GetCommonProperties(
      this,
      customProperties,
      tags,
      owner
    );

    let commonProps = await getCommonProps.getAll();

    return await this.repoClient
      .Post(`contentlibrary`, { name, ...commonProps })
      .then((res) => res.data as IContentLibrary);
  }

  public async contentLibraryGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IContentLibrary> {
    let url = "contentlibrary";
    if (id) url += `/${id}`;

    return await this.repoClient
      .Get(url)
      .then((res) => res.data as IContentLibrary);
  }

  public async contentLibraryGetFilter(
    this: QlikRepoApi,
    filter: string,
    orderBy?: string
  ): Promise<IContentLibrary[]> {
    if (!filter)
      throw new Error(
        `contentLibraryGetFilter: "filter" parameter is required`
      );

    const urlBuild = new URLBuild(`contentlibrary/full`);
    urlBuild.addParam("filter", filter);
    urlBuild.addParam("orderby", orderBy);

    return await this.repoClient
      .Get(urlBuild.getUrl())
      .then((res) => res.data as IContentLibrary[]);
  }

  // TODO: need to be tested!
  public async contentLibraryExport(
    this: QlikRepoApi,
    name: string,
    sourceFileName?: string
  ): Promise<IContentLibraryFile[]> {
    const library: IContentLibrary[] = await this.contentLibraryGetFilter(
      `name eq '${name}'`
    );

    if (library.length == 0)
      throw new Error(`contentLibraryExport: library "${name}" do not exists`);
    if (library.length > 1)
      throw new Error(
        `contentLibraryExport: more than one library "${name}" found`
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
        `contentLibraryExport: No file(s) in content library "${name}"`
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
  public async contentLibraryImport(
    this: QlikRepoApi,
    name: string,
    file: Buffer,
    arg?: {
      externalPath?: string;
      overwrite?: boolean;
    }
  ) {
    if (!name)
      throw new Error(`contentLibraryImport: "name" parameter is required`);
    if (!file)
      throw new Error(`contentLibraryImport: "file" parameter is required`);

    const urlBuild = new URLBuild(`contentlibrary/${name}/uploadfile`);
    urlBuild.addParam("externalpath", arg.externalPath || undefined);
    urlBuild.addParam("overwrite", arg.overwrite || undefined);

    const mimeType = getMime(file);
    return await this.repoClient
      .Put(urlBuild.getUrl(), {}, mimeType)
      .then((res) => res.data as IContentLibrary[]);
  }

  // TODO: test + is externalPath required
  public async contentLibraryImportForApp(
    this: QlikRepoApi,
    appId: string,
    file: Buffer,
    arg?: {
      externalPath?: string;
      overwrite?: boolean;
    }
  ) {
    if (!appId)
      throw new Error(`contentLibraryImport: "name" parameter is required`);
    if (!file)
      throw new Error(`contentLibraryImport: "file" parameter is required`);

    const urlBuild = new URLBuild(`appcontent/${appId}/uploadfile`);
    urlBuild.addParam("externalpath", arg.externalPath || undefined);
    urlBuild.addParam("overwrite", arg.overwrite || undefined);

    const mimeType = getMime(file);
    return await this.repoClient
      .Put(urlBuild.getUrl(), {}, mimeType)
      .then((res) => res.data as IContentLibrary[]);
  }

  public async contentLibraryRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id)
      throw new Error(`contentLibraryRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`contentlibrary/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async contentLibraryRemoveFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IRemoveFilter[]> {
    if (!filter)
      throw new Error(
        `contentLibraryRemoveFilter: "filter" parameter is required`
      );
    const contentLibraries = await this.contentLibraryGetFilter(filter);
    return Promise.all<IRemoveFilter>(
      contentLibraries.map((contentLib: IContentLibrary) => {
        return this.repoClient
          .Delete(`contentlibrary/${contentLib.id}`)
          .then((res: IHttpReturn) => {
            return { id: contentLib.id, status: res.status };
          });
      })
    );
  }

  public async contentLibrarySelect(
    this: QlikRepoApi,
    filter?: string
  ): Promise<ISelection> {
    const urlBuild = new URLBuild(`selection/contentlibrary`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  // REVIEW: verify the logic here
  public async contentLibraryUpdate(
    this: QlikRepoApi,
    arg: IContentLibraryUpdate
  ): Promise<IContentLibrary> {
    if (!arg.id)
      throw new Error(`contentLibraryUpdate: "id" parameter is required`);

    let contentLibrary = await this.contentLibraryGet(arg.id);

    if (arg.modifiedByUserName)
      contentLibrary.modifiedByUserName = arg.modifiedByUserName;

    let updateCommon = new UpdateCommonProperties(this, contentLibrary, arg);
    contentLibrary = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`contentlibrary/${arg.id}`, { ...contentLibrary })
      .then((res) => res.data as IContentLibrary);
  }
}
