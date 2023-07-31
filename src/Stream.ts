import { QlikRepositoryClient } from "qlik-rest-api";
import { IUpdateObjectOptions } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { IStream, IStreamUpdate } from "./types/interfaces";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassStream {
  remove(): Promise<IHttpStatus>;
  update(arg: IStreamUpdate, options?: IUpdateObjectOptions): Promise<IStream>;
  details: IStream;
}

export class Stream implements IClassStream {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IStream;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: IStream) {
    if (!id) throw new Error(`stream.get: "id" parameter is required`);

    this.details = {} as IStream;
    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IStream>(`stream/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`stream/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: IStreamUpdate, options?: IUpdateObjectOptions) {
    if (arg.name) this.details.name = arg.name;

    const updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put<IStream>(`stream/${this.details.id}`, { ...this.details })
      .then((res) => res.data);
  }
}
