import { QlikRepositoryClient } from "qlik-rest-api";
import {
  IUpdateObjectOptions,
  IDataConnection,
  IDataConnectionUpdate,
} from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassDataConnection {
  remove(): Promise<IHttpStatus>;
  update(
    arg: IDataConnectionUpdate,
    options?: IUpdateObjectOptions
  ): Promise<IDataConnection>;
  details: IDataConnection;
}

export class DataConnection implements IClassDataConnection {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IDataConnection;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IDataConnection
  ) {
    if (!id) throw new Error(`dataConnections.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get(`dataconnection/${this.#id}`)
        .then((res) => res.data as IDataConnection);
    }
  }

  async remove() {
    return await this.#repoClient
      .Delete(`dataconnection/${this.details.id}`)
      .then((res) => res.status);
  }

  public async update(
    arg: IDataConnectionUpdate,
    options?: IUpdateObjectOptions
  ) {
    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put(`dataconnection/${this.details.id}`, { ...this.details })
      .then((res) => res.data as IDataConnection);
  }
}
