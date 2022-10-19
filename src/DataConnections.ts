import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { GetCommonProperties } from "./util/GetCommonProps";

import {
  IEntityRemove,
  ISelection,
  IDataConnectionCreate,
  IDataConnection,
} from "./types/interfaces";
import { DataConnection } from "./DataConnection";

export interface IClassDataConnections {
  get(arg: { id: string }): Promise<DataConnection>;
  getAll(): Promise<DataConnection[]>;
  getFilter(arg: {
    filter: string;
    orderBy?: string;
  }): Promise<DataConnection[]>;
  create(arg: IDataConnectionCreate): Promise<DataConnection>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class DataConnections implements IClassDataConnections {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id)
      throw new Error(`dataConnections.get: "id" parameter is required`);

    const dc: DataConnection = new DataConnection(
      this.#repoClient,
      arg.id,
      null
    );
    await dc.init();

    return dc;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IDataConnection[]>(`dataconnection/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new DataConnection(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string; orderBy?: string }) {
    if (!arg.filter)
      throw new Error(
        `dataConnection.getFilter: "filter" parameter is required`
      );

    const urlBuild = new URLBuild(`dataconnection/full`);
    urlBuild.addParam("filter", arg.filter);
    urlBuild.addParam("orderby", arg.orderBy);

    return await this.#repoClient
      .Get<IDataConnection[]>(urlBuild.getUrl())
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new DataConnection(this.#repoClient, t.id, t));
      });
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `dataConnection.removeFilter: "filter" parameter is required`
      );

    const dcs = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      dcs.map((dc) =>
        dc.remove().then((s) => ({ id: dc.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/dataconnection`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async create(arg: IDataConnectionCreate) {
    if (!arg.name)
      throw new Error(`dataConnection.create: "name" parameter is required`);
    if (!arg.connectionString)
      throw new Error(
        `dataConnection.create: "connectionString" parameter is required`
      );

    let data: { [k: string]: any } = {};
    data["name"] = arg.name;
    data["connectionstring"] = arg.connectionString;

    if (arg.type) data["type"] = arg.type;
    if (arg.architecture) {
      if (arg.architecture == "Undefined") data["architecture"] = 0;
      if (arg.architecture == "x86") data["architecture"] = 1;
      if (arg.architecture == "x64") data["architecture"] = 2;
      if (!data["architecture"]) data["architecture"] = 0;
    }
    if (arg.logOn) {
      if (arg.logOn == "Service user") data["logOn"] = 0;
      if (arg.logOn == "Current user") data["logOn"] = 1;
      if (!data["logOn"]) data["logOn"] = 0;
    }
    if (arg.username) data["username"] = arg.username;
    if (arg.password) data["password"] = arg.password;
    // data["engineObjectId"] = uuid();

    const getCommonProps = new GetCommonProperties(
      this.#repoClient,
      arg.customProperties,
      arg.tags,
      arg.owner
    );

    const commonProps = await getCommonProps.getAll();
    const d = { ...data, ...commonProps };

    return await this.#repoClient
      .Post<IDataConnection>(`dataconnection`, { ...data, ...commonProps })
      .then((res) => res.data)
      .then((d) => new DataConnection(this.#repoClient, d.id, d));
  }
}
