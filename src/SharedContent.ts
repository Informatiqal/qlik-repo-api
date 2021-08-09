import { QlikRepositoryClient } from "qlik-rest-api";
import { IEntityRemove } from "./types/interfaces";
import { ISharedContent, ISharedContentUpdate } from "./SharedContents";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { URLBuild } from "./util/generic";

export interface IClassSharedContent {
  remove(): Promise<IEntityRemove>;
  update(arg: ISharedContentUpdate): Promise<ISharedContent>;
  uploadFile(file: Buffer, externalPath: string): Promise<string>;
  deleteFile(externalPath: string): Promise<IEntityRemove>;
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
      .then((res) => {
        return { id: this.id, status: res.status } as IEntityRemove;
      });
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
      .Put(`sharedcontent/${arg.id}`, { ...this.details })
      .then((res) => res.data as ISharedContent);
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

    return await this.repoClient
      .Post(urlBuild.getUrl(), file)
      .then((res) => res.data as string);
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

    return await this.repoClient.Delete(urlBuild.getUrl()).then((res) => {
      return { id: this.details.id, status: res.status } as IEntityRemove;
    });
  }
}
