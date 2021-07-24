import { QlikRepoApi } from "./main";
import { URLBuild, uuid } from "./util/generic";
import { GetCommonProperties } from "./util/GetCommonProps";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import {
  IDataConnection,
  IDataConnectionCondensed,
  IHttpReturnRemove,
} from "./interfaces";

import {
  IDataConnectionCreate,
  IDataConnectionUpdate,
} from "./interfaces/argument.interface";

export class DataConnection {
  constructor() {}

  public async dataConnectionGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IDataConnection[] | IDataConnectionCondensed[]> {
    let url = `dataconnection`;
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res) => {
      if (!id) return res.data as IDataConnectionCondensed[];

      return [res.data] as IDataConnection[];
    });
  }

  public async dataConnectionGetFilter(
    this: QlikRepoApi,
    filter: string,
    orderBy?: string
  ): Promise<IDataConnection[]> {
    if (!filter)
      throw new Error(
        `dataConnectionGetFilter: "filter" parameter is required`
      );

    const urlBuild = new URLBuild(`dataconnection/full`);
    urlBuild.addParam("filter", filter);
    urlBuild.addParam("orderby", orderBy);

    return await this.repoClient
      .Get(urlBuild.getUrl())
      .then((res) => res.data as IDataConnection[]);
  }

  public async dataConnectionRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id)
      throw new Error(`dataConnectionRemove: "id" parameter is required`);
    return await this.repoClient.Delete(`dataconnection/${id}`).then((res) => {
      return { id, status: res.status };
    });
  }

  public async dataConnectionCreate(
    this: QlikRepoApi,
    arg: IDataConnectionCreate
  ): Promise<IDataConnection> {
    if (!arg.name)
      throw new Error(`dataConnectionCreate: "id" parameter is required`);
    if (!arg.connectionString)
      throw new Error(
        `dataConnectionCreate: "connectionString" parameter is required`
      );
    if (!arg.owner)
      throw new Error(`dataConnectionCreate: "owner" parameter is required`);

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
      this,
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

  public async dataConnectionUpdate(
    this: QlikRepoApi,
    arg: IDataConnectionUpdate
  ): Promise<IDataConnection> {
    if (!arg.id)
      throw new Error(`dataConnectionUpdate: "id" parameter is required`);

    let dataConnection = await this.dataConnectionGet(arg.id).then(
      (d) => d[0] as IDataConnection
    );

    let updateCommon = new UpdateCommonProperties(this, dataConnection, arg);
    dataConnection = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`dataconnection/${arg.id}`, { ...dataConnection })
      .then((res) => res.data as IDataConnection);
  }
}
