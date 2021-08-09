import { QlikRepositoryClient } from "qlik-rest-api";
import { modifiedDateTime } from "./util/generic";
import { IEntityRemove } from "./types/interfaces";
import { IStream, IStreamUpdate } from "./Streams";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassStream {
  remove(): Promise<IEntityRemove>;
  update(arg: IStreamUpdate): Promise<IStream>;
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
    return await this.repoClient.Delete(`stream/${this.id}`).then((res) => {
      return { id: this.id, status: res.status } as IEntityRemove;
    });
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
      .then((res) => res.data as IStream);
  }
}
