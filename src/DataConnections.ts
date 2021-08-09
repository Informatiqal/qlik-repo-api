import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { GetCommonProperties } from "./util/GetCommonProps";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { IClassDataConnection, DataConnection } from "./DataConnection";
import { ICustomPropertyValue } from "./CustomProperties";
import { ITagCondensed } from "./Tags";
import { IUserCondensed } from "./Users";

export interface IDataConnectionCondensed {
  id?: string;
  privileges?: string[];
  name: string;
  connectionstring: string;
  type?: string;
  engineObjectId?: string;
  username?: string;
  password?: string;
  logOn?: number;
  architecture?: number;
}

export interface IDataConnection extends IDataConnectionCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  customProperties: ICustomPropertyValue[];
  tags: ITagCondensed[];
  owner: IUserCondensed;
}

export type TDataConnectionArchitecture = "x86" | "x64" | "Undefined";

export type TDataConnectionLogOn = "Current user" | "Service user";

export interface IDataConnectionCreate {
  name: string;
  connectionString: string;
  owner?: string;
  type?: string;
  username?: string;
  password?: string;
  architecture?: TDataConnectionArchitecture;
  logOn?: TDataConnectionLogOn;
  tags?: string[];
  customProperties?: string[];
}

export interface IDataConnectionUpdate {
  id: string;
  connectionString?: string;
  username?: string;
  password?: string;
  owner?: string;
  tags?: string[];
  customProperties?: string[];
}

export interface IClassDataConnections {
  get(id: string): Promise<IClassDataConnection>;
  getAll(): Promise<IClassDataConnection[]>;
  getFilter(filter: string, orderBy?: string): Promise<IClassDataConnection[]>;
  create(arg: IDataConnectionCreate): Promise<IClassDataConnection>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
  update(arg: IDataConnectionUpdate): Promise<IDataConnection>;
}

export class DataConnections implements IClassDataConnections {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`dataConnections.get: "id" parameter is required`);

    const dc: DataConnection = new DataConnection(this.repoClient, id, null);
    await dc.init();

    return dc;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`dataconnection/full`)
      .then((res) => res.data as IDataConnection[])
      .then((data) => {
        return data.map((t) => {
          return new DataConnection(this.repoClient, t.id, t);
        });
      });
  }

  public async getFilter(filter: string, orderBy?: string) {
    if (!filter)
      throw new Error(
        `dataConnection.getFilter: "filter" parameter is required`
      );

    const urlBuild = new URLBuild(`dataconnection/full`);
    urlBuild.addParam("filter", filter);
    urlBuild.addParam("orderby", orderBy);

    return await this.repoClient
      .Get(urlBuild.getUrl())
      .then((res) => res.data as IDataConnection[])
      .then((data) => {
        return data.map((t) => {
          return new DataConnection(this.repoClient, t.id, t);
        });
      });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `dataConnection.removeFilter: "filter" parameter is required`
      );

    const dcs = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      dcs.map((dc: IClassDataConnection) => {
        return dc.remove();
      })
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/dataconnection`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async create(arg: IDataConnectionCreate) {
    if (!arg.name)
      throw new Error(`dataConnection.create: "id" parameter is required`);
    if (!arg.connectionString)
      throw new Error(
        `dataConnection.create: "connectionString" parameter is required`
      );

    let data = {
      name: arg.name,
      connectionstring: arg.connectionString,
    };

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

    let getCommonProps = new GetCommonProperties(
      this.repoClient,
      arg.customProperties,
      arg.tags,
      arg.owner
    );

    let commonProps = await getCommonProps.getAll();
    let d = { ...data, ...commonProps };

    return await this.repoClient
      .Post(`dataconnection`, { ...data, ...commonProps })
      .then((res) => res.data as IDataConnection)
      .then((d) => new DataConnection(this.repoClient, d.id, d));
  }

  public async update(arg: IDataConnectionUpdate) {
    if (!arg.id)
      throw new Error(`dataConnection.update: "id" parameter is required`);

    let dataConnection = await this.get(arg.id);

    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      dataConnection,
      arg
    );
    dataConnection = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`dataconnection/${arg.id}`, { ...dataConnection })
      .then((res) => res.data as IDataConnection);
  }
}
