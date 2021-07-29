import { QlikRepositoryClient } from "./main";
import { URLBuild, uuid } from "./util/generic";
import { GetCommonProperties } from "./util/GetCommonProps";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { ICustomPropertyCondensed } from "./CustomProperty";
import { ITagCondensed } from "./Tag";
import { IUserCondensed } from "./User";

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
  customProperties: ICustomPropertyCondensed[];
  tags: ITagCondensed[];
  owner: IUserCondensed;
}

export type TDataConnectionArchitecture = "x86" | "x64" | "Undefined";
export type TDataConnectionLogOn = "Current user" | "Service user";

export interface IDataConnectionCreate {
  name: string;
  connectionString: string;
  owner: string;
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

export interface IClassDataConnection {
  get(id: string): Promise<IDataConnection>;
  getAll(): Promise<IDataConnectionCondensed[]>;
  getFilter(filter: string, orderBy?: string): Promise<IDataConnection[]>;
  create(arg: IDataConnectionCreate): Promise<IDataConnection>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
  update(arg: IDataConnectionUpdate): Promise<IDataConnection>;
}

export class DataConnection implements IClassDataConnection {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`dataConnection.get: "id" parameter is required`);

    return await this.repoClient
      .Get(`dataconnection/${id}`)
      .then((res) => res.data as IDataConnection);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`dataconnection`)
      .then((res) => res.data as IDataConnectionCondensed[]);
  }

  public async getFilter(
    filter: string,
    orderBy?: string
  ): Promise<IDataConnection[]> {
    if (!filter)
      throw new Error(
        `dataConnection.getFilter: "filter" parameter is required`
      );

    const urlBuild = new URLBuild(`dataconnection/full`);
    urlBuild.addParam("filter", filter);
    urlBuild.addParam("orderby", orderBy);

    return await this.repoClient
      .Get(urlBuild.getUrl())
      .then((res) => res.data as IDataConnection[]);
  }

  public async remove(id: string) {
    if (!id)
      throw new Error(`dataConnection.remove: "id" parameter is required`);
    return await this.repoClient.Delete(`dataconnection/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `dataConnection.removeFilter: "filter" parameter is required`
      );

    const tags = await this.getFilter(filter).then((t: IDataConnection[]) => {
      if (t.length == 0)
        throw new Error(
          `dataConnection.removeFilter: filter query return 0 items`
        );

      return t;
    });
    return await Promise.all<IEntityRemove>(
      tags.map((tag: IDataConnection) => {
        return this.remove(tag.id);
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
    if (!arg.owner)
      throw new Error(`dataConnection.create: "owner" parameter is required`);

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
    data["engineObjectId"] = uuid();

    let getCommonProps = new GetCommonProperties(
      this.repoClient,
      arg.customProperties,
      arg.tags,
      arg.owner
    );

    let commonProps = await getCommonProps.getAll();

    return await this.repoClient
      .Post(`dataconnection`, { data, ...commonProps })
      .then((res) => {
        return res.data as IDataConnection;
      });
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
