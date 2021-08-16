import { QlikRepositoryClient } from "qlik-rest-api";
import { IHttpStatus } from "./types/interfaces";
import { IStream, IStreamUpdate } from "./Streams";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassStream {
  remove(): Promise<IHttpStatus>;
  update(arg: IStreamUpdate): Promise<IHttpStatus>;
  details: IStream;
}

export class Stream implements IClassStream {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: IStream;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: IStream) {
    if (!id) throw new Error(`tags.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`stream/${this.id}`)
        .then((res) => res.data as IStream);
    }
  }

  public async remove() {
    return await this.repoClient
      .Delete(`stream/${this.id}`)
      .then((res) => res.status);
  }

  public async update(arg: IStreamUpdate) {
    if (arg.name) this.details.name = arg.name;

    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      this.details,
      arg
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`stream/${this.details.id}`, { ...this.details })
      .then((res) => res.status);
  }
}
