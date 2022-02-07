import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import {
  IHttpStatus,
  IStaticContentReferenceCondensed,
  IUpdateObjectOptions,
} from "./types/interfaces";
import {
  IContentLibrary,
  IContentLibraryFile,
  IContentLibraryUpdate,
} from "./ContentLibraries";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassContentLibrary {
  export(arg: { sourceFileName?: string }): Promise<IContentLibraryFile[]>;
  remove(): Promise<IHttpStatus>;
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
        .Get(`contentlibrary/${this.#id}`)
        .then((res) => res.data as IContentLibrary);
    }
  }

  async export(arg: { sourceFileName?: string }) {
    let files: IStaticContentReferenceCondensed[] = [];

    if (
      this.#repoClient.configFull.port &&
      this.#repoClient.configFull.port == 4242
    )
      throw new Error(
        `contentLibrary.export: exporting content library is not possible when the authentication is made with certificates`
      );
    if (arg.sourceFileName) {
      // if only one file have to be extracted
      files = this.details.references.filter((r) => {
        return r.logicalPath.replace(/^.*[\\\/]/, "") == arg.sourceFileName;
      });
    }

    // if all the files from the library have to be extracted
    if (!arg.sourceFileName) files = this.details.references;

    if (files.length == 0)
      throw new Error(
        `contentLibrary.export: No file(s) in content library "${this.details.name}"`
      );

    return await Promise.all<IContentLibraryFile>(
      files.map(async (f) => {
        const logicalPath =
          f.logicalPath[0] == "/" ? f.logicalPath.substr(1) : f.logicalPath;
        const fileContent = await this.#genericClient.Get(logicalPath);
        return {
          name: f.logicalPath.replace(/^.*[\\\/]/, ""),
          file: fileContent.data,
        };
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
      .Put(`contentlibrary/${this.details.id}`, { ...this.details })
      .then((res) => res.data as IContentLibrary);
  }
}
