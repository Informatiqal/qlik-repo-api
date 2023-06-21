// import { getMime } from "name2mime";
import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import {
  IStaticContentReferenceCondensed,
  IUpdateObjectOptions,
} from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import {
  IContentLibrary,
  IContentLibraryFile,
  IContentLibraryUpdate,
  IContentLibraryImport,
} from "./types/interfaces";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { URLBuild } from "./util/generic";
import { IncomingMessage } from "http";

export interface IClassContentLibrary {
  export(arg: { sourceFileName?: string }): Promise<IContentLibraryFile>;
  exportMany(arg?: {
    sourceFileNames: string[];
  }): Promise<IContentLibraryFile[]>;
  remove(): Promise<IHttpStatus>;
  importFile(arg: IContentLibraryImport): Promise<{
    status: IHttpStatus;
    fileDetails: IStaticContentReferenceCondensed;
  }>;
  importFileMany(
    arg: IContentLibraryImport[]
  ): Promise<
    { status: IHttpStatus; fileDetails: IStaticContentReferenceCondensed }[]
  >;
  removeFile(arg: { externalPath: string }): Promise<IHttpStatus>;
  removeFileMany(
    arg: string[]
  ): Promise<{ status: number; externalPath: string }[]>;
  update(
    arg: IContentLibraryUpdate,
    options?: IUpdateObjectOptions
  ): Promise<IContentLibrary>;
  details: IContentLibrary;
}

export class ContentLibrary implements IClassContentLibrary {
  #id: string;
  #repoClient: QlikRepositoryClient;
  #genericClient: QlikGenericRestClient;
  details: IContentLibrary;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IContentLibrary,
    genericClient?: QlikGenericRestClient
  ) {
    if (!id) throw new Error(`contentLibrary.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    this.#genericClient = genericClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IContentLibrary>(`contentlibrary/${this.#id}`)
        .then((res) => res.data);
    }
  }

  async export(arg: { sourceFileName: string }) {
    if (!arg.sourceFileName)
      throw new Error(
        `contentLibrary.export: "sourceFileName" parameter is required`
      );

    if (
      this.#repoClient.configFull.port &&
      this.#repoClient.configFull.port == 4242
    )
      throw new Error(
        `contentLibrary.export: exporting content library is not possible when the authentication is made with certificates`
      );

    const file = this.details.references.filter((r) => {
      return r.logicalPath.replace(/^.*[\\\/]/, "") == arg.sourceFileName;
    });

    if (file.length == 0)
      throw new Error(
        `contentLibrary.export: file "${arg.sourceFileName}" not found in content library "${this.details.name}"`
      );

    const logicalPath =
      file[0].logicalPath[0] == "/"
        ? file[0].logicalPath.substring(1)
        : file[0].logicalPath;

    const fileContent = await this.#genericClient.Get<IncomingMessage>(
      logicalPath,
      "",
      "stream"
    );

    return {
      name: file[0].logicalPath.replace(/^.*[\\\/]/, ""),
      path: `/${file[0].logicalPath.split("/").slice(2).join("/")}`,
      file: fileContent.data,
    };
  }

  async exportMany(arg?: { sourceFileNames: string[] }) {
    let files: IStaticContentReferenceCondensed[] = [];

    if (!arg) files = this.details.references;
    if (arg && !arg.sourceFileNames)
      throw new Error(
        `contentLibrary.exportMany: "sourceFileNames" parameter is required`
      );

    if (arg)
      files = this.details.references.filter((r) => {
        return arg.sourceFileNames.includes(
          r.logicalPath.replace(`/content/${this.details.name}/`, "")
        );
      });

    return Promise.all(
      files.map((r) => {
        return this.export({
          sourceFileName: r.logicalPath.replace(/^.*[\\\/]/, ""),
        });
      })
    );
  }

  public async importFile(arg: IContentLibraryImport) {
    if (!arg.file)
      throw new Error(`contentLibrary.import: "file" parameter is required`);

    if (!arg.externalPath)
      throw new Error(
        `contentLibrary.import: "externalPath" parameter is required`
      );

    const urlBuild = new URLBuild(
      `contentlibrary/${this.details.name}/uploadfile`
    );
    urlBuild.addParam("externalpath", arg.externalPath);
    urlBuild.addParam("overwrite", arg.overwrite || undefined);

    // const mimeType = getMime(arg.file);

    return await this.#repoClient
      .Post<{
        status: IHttpStatus;
        fileDetails: IStaticContentReferenceCondensed;
      }>(urlBuild.getUrl(), arg.file)
      .then(async (res) => {
        this.details = await this.#repoClient
          .Get<IContentLibrary>(`contentlibrary/${this.#id}`)
          .then((res) => res.data);

        const toReplace = `/content/${this.details.name}/`;
        const fileDetails = this.details.references.filter(
          (r) => r.externalPath.replace(toReplace, "") == arg.externalPath
        )[0];

        return { status: res.status, fileDetails: fileDetails };
      });
  }

  public async importFileMany(arg: IContentLibraryImport[]) {
    return Promise.all(
      arg.map((cl) => {
        return this.importFile(cl);
      })
    );
  }

  public async removeFile(arg: { externalPath: string }) {
    if (!arg.externalPath)
      throw new Error(
        `contentLibrary.removeFile: "externalPath" parameter is required`
      );

    const urlBuild = new URLBuild(
      `contentlibrary/${this.details.name}/deletecontent`
    );
    urlBuild.addParam("externalpath", arg.externalPath);

    return await this.#repoClient
      .Delete(urlBuild.getUrl())
      .then((res) => res.status);
  }

  public async removeFileMany(arg: string[]) {
    return await Promise.all(
      arg.map((fileName) => {
        return this.removeFile({ externalPath: fileName }).then((r) => ({
          status: r,
          externalPath: fileName,
        }));
      })
    );
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`contentlibrary/${this.details.id}`)
      .then((res) => res.status);
  }

  public async update(
    arg: IContentLibraryUpdate,
    options?: IUpdateObjectOptions
  ) {
    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );

    if (arg.name) this.details.name = arg.name;

    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put<IContentLibrary>(`contentlibrary/${this.details.id}`, {
        ...this.details,
      })
      .then((res) => res.data);
  }
}
