import { QlikRepositoryClient } from "qlik-rest-api";
import { IHttpStatus } from "./types/interfaces";
import { ISharedContent, ISharedContentUpdate } from "./SharedContents";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { URLBuild } from "./util/generic";

export interface IClassSharedContent {
  remove(): Promise<IHttpStatus>;
  update(arg: ISharedContentUpdate): Promise<IHttpStatus>;
  uploadFile(file: Buffer, externalPath: string): Promise<IHttpStatus>;
  deleteFile(externalPath: string): Promise<IHttpStatus>;
  details: ISharedContent;
}

export class SharedContent implements IClassSharedContent {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: ISharedContent;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: ISharedContent
  ) {
    if (!id) throw new Error(`sharedContent.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`sharedcontent/${this.id}`)
        .then((res) => res.data as ISharedContent);
    }
  }

  public async remove() {
    return await this.repoClient
      .Delete(`sharedcontent/${this.id}`)
      .then((res) => res.status);
  }

  public async update(arg: ISharedContentUpdate) {
    if (arg.name) this.details.name = arg.name;
    if (arg.description) this.details.description = arg.description;
    if (arg.type) this.details.type = arg.type;

    const updateCommon = new UpdateCommonProperties(
      this.repoClient,
      this.details,
      arg
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`sharedcontent/${this.details.id}`, { ...this.details })
      .then((res) => res.status);
  }

  public async uploadFile(file: Buffer, externalPath: string) {
    if (!file)
      throw new Error(`sharedContent.uploadFile: "file" parameter is required`);
    if (!externalPath)
      throw new Error(
        `sharedContent.uploadFile: "externalPath" parameter is required`
      );

    const urlBuild = new URLBuild(
      `sharedcontent/${this.details.id}/uploadfile`
    );
    urlBuild.addParam("externalpath", externalPath);

    const status = await this.repoClient
      .Post(urlBuild.getUrl(), file)
      .then((res) => res.status);

    // clear the details
    this.details = {} as ISharedContent;
    // get the latest details
    await this.init();

    return status;
  }

  public async deleteFile(externalPath: string) {
    if (!externalPath)
      throw new Error(
        `sharedContent.deleteFile: "externalPath" parameter is required`
      );

    const urlBuild = new URLBuild(
      `sharedcontent/${this.details.id}/deletecontent`
    );
    urlBuild.addParam("externalpath", externalPath);

    const status = await this.repoClient
      .Delete(urlBuild.getUrl())
      .then((res) => res.status);

    this.details = {} as ISharedContent;
    await this.init();

    return status;
  }
}
