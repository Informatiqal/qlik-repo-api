import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { CustomProperty, IClassCustomProperty } from "./CustomProperty";

export type TCustomPropObjectTypes =
  | "App"
  | "AnalyticConnection"
  | "ContentLibrary"
  | "DataConnection"
  | "EngineService"
  | "Extension"
  | "ExternalProgramTask"
  | "ServerNodeConfiguration"
  | "PrintingService"
  | "ProxyService"
  | "ReloadTask"
  | "RepositoryService"
  | "SchedulerService"
  | "Stream"
  | "UserSyncTask"
  | "User"
  | "VirtualProxyConfig";

export interface ICustomPropertyCreate {
  name: string;
  description?: string;
  choiceValues?: string[];
  objectTypes?: TCustomPropObjectTypes[];
  valueType?: string;
}

export interface ICustomPropertyUpdate {
  name?: string;
  description?: string;
  choiceValues?: string[];
  objectTypes?: TCustomPropObjectTypes[];
  valueType?: string;
}

export interface ICustomPropertyValue {
  createdDate: string;
  schemaPath: string;
  modifiedDate: string;
  definition: {
    privileges: [];
    valueType: string;
    name: string;
    choiceValues: string[];
    id: string;
  };
  id: string;
  value: string;
}

export interface ICustomPropertyCondensed {
  privileges: string[];
  valueType: string;
  name: string;
  choiceValues: string[];
  id: string;
}

export interface ICustomProperty extends ICustomPropertyCondensed {
  createdDate: string;
  schemaPath: string;
  modifiedDate: string;
  description: string;
  objectTypes: TCustomPropObjectTypes[];
}

export interface IClassCustomProperties {
  get(arg: { id: string }): Promise<IClassCustomProperty>;
  getAll(): Promise<IClassCustomProperty[]>;
  getFilter(arg: { filter: string }): Promise<IClassCustomProperty[]>;
  create(arg: ICustomPropertyCreate): Promise<IClassCustomProperty>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class CustomProperties implements IClassCustomProperties {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id)
      throw new Error(`customProperty.get: "id" parameter is required`);

    const cp: CustomProperty = new CustomProperty(this.#repoClient, arg.id);
    await cp.init();

    return cp;
  }

  public async getAll() {
    return await this.#repoClient
      .Get(`custompropertydefinition/full`)
      .then((res) => res.data as ICustomProperty[])
      .then((data) => {
        return data.map((t) => new CustomProperty(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `customProperty.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get(
        `custompropertydefinition/full?filter=(${encodeURIComponent(
          arg.filter
        )})`
      )
      .then((res) => res.data as ICustomProperty[])
      .then((data) => {
        return data.map((t) => new CustomProperty(this.#repoClient, t.id, t));
      });
  }

  public async create(arg: ICustomPropertyCreate) {
    if (!arg.name)
      throw new Error(`customProperty.create: "name" parameter is required`);

    if (/^[A-Za-z0-9_]+$/.test(arg.name) == false)
      throw new Error(
        `customProperty.create: "name" should be alphanumeric value`
      );

    return await this.#repoClient
      .Post(
        `custompropertydefinition`,
        {
          name: arg.name,
          description: arg.description || "",
          choiceValues: arg.choiceValues || [],
          objectTypes: arg.objectTypes || [],
          valueType: arg.valueType || "Text",
        },
        "application/json"
      )
      .then((res) => res.data as ICustomProperty)
      .then((c) => new CustomProperty(this.#repoClient, c.id, c));
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `customProperty.removeFilter: "filter" parameter is required`
      );

    const customProperties = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      customProperties.map((cp: IClassCustomProperty) =>
        cp.remove().then((s) => ({ id: cp.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/custompropertydefinition`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
