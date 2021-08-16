import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import {
  IHttpStatus,
  IStaticContentReferenceCondensed,
} from "./types/interfaces";
import {
  IContentLibrary,
  IContentLibraryFile,
  IContentLibraryUpdate,
} from "./ContentLibraries";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassContentLibrary {
  export(sourceFileName?: string): Promise<IContentLibraryFile[]>;
  remove(): Promise<IHttpStatus>;
  update(arg: IContentLibraryUpdate): Promise<IHttpStatus>;
  details: IContentLibrary;
}

export class ContentLibrary implements IClassContentLibrary {
  private id: string;
  private repoClient: QlikRepositoryClient;
  private genericClient: QlikGenericRestClient;
  details: IContentLibrary;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IContentLibrary,
    genericClient?: QlikGenericRestClient
  ) {
    if (!id) throw new Error(`tags.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    this.genericClient = genericClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`contentlibrary/${this.id}`)
        .then((res) => res.data as IContentLibrary);
    }
  }

  // TODO: need to be tested!
  async export(name: string, sourceFileName?: string) {
    let files: IStaticContentReferenceCondensed[] = [];

    // if only one file have to be extracted
    if (sourceFileName) {
      files = this.details.references.filter((r) => {
        return r.logicalPath.replace(/^.*[\\\/]/, "") == sourceFileName;
      });
    }

    // if all the files from the library have to be extracted
    if (!sourceFileName) files = this.details.references;

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

  public async remove() {
    return await this.repoClient
      .Delete(`contentlibrary/${this.details.id}`)
      .then((res) => res.status);
  }

  // REVIEW: verify the logic here
  public async update(arg: IContentLibraryUpdate) {
    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      this.details,
      arg
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`contentlibrary/${this.details.id}`, { ...this.details })
      .then((res) => res.status);
  }
}
