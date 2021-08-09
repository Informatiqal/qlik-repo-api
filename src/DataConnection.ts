import { QlikRepositoryClient } from "qlik-rest-api";
import { IEntityRemove } from "./types/interfaces";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { IDataConnection, IDataConnectionUpdate } from "./DataConnections";

export interface IClassDataConnection {
  remove(): Promise<IEntityRemove>;
  update(arg: IDataConnectionUpdate): Promise<IDataConnection>;
  details: IDataConnection;
}

export class DataConnection implements IClassDataConnection {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: IDataConnection;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IDataConnection
  ) {
    if (!id) throw new Error(`dataConnections.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`dataconnection/${this.id}`)
        .then((res) => res.data as IDataConnection);
    }
  }

  async remove() {
    return await this.repoClient
      .Delete(`dataconnection/${this.details.id}`)
      .then((res) => {
        return { id: this.details.id, status: res.status } as IEntityRemove;
      });
  }

  public async update(arg: IDataConnectionUpdate) {
    if (!arg.id)
      throw new Error(`dataConnection.update: "id" parameter is required`);
    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      this.details,
      arg
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`dataconnection/${arg.id}`, { ...this.details })
      .then((res) => res.data as IDataConnection);
  }
}
