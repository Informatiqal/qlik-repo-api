import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { IHttpStatus, IEntityRemove, ISelection } from "./types/interfaces";

import { modifiedDateTime } from "./util/generic";

export type TCustomPropObjectTypes =
  | "App"
  | "AnalyticConnection"
  | "ContentLibrary"
  | "DataConnection"
  | "EngineService"
  | "Extension"
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

export interface ICustomPropertyUpdate extends ICustomPropertyCreate {
  id: string;
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

export interface IClassCustomProperty {
  get(id: string): Promise<ICustomProperty>;
  getAll(): Promise<ICustomPropertyCondensed[]>;
  getFilter(
    filter: string,
    full?: boolean
  ): Promise<ICustomPropertyCondensed[]>;
  create(arg: ICustomPropertyCreate): Promise<ICustomProperty>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  update(arg: ICustomPropertyUpdate): Promise<ICustomProperty>;
}

export class CustomProperty {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`customPropertyGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`custompropertydefinition/${id}`)
      .then((res) => res.data as ICustomProperty);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`custompropertydefinition`)
      .then((res) => res.data as ICustomPropertyCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(
        `customPropertyGetFilter: "filter" parameter is required`
      );

    return await this.repoClient
      .Get(`custompropertydefinition?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ICustomPropertyCondensed[]);
  }

  public async create(arg: ICustomPropertyCreate) {
    if (!arg.name)
      throw new Error(`customPropertyCreate: "name" parameter is required`);

    return await this.repoClient
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
      .then((res) => res.data as ICustomProperty);
  }

  public async remove(id: string) {
    if (!id)
      throw new Error(`customPropertyRemove: "id" parameter is required`);

    return await this.repoClient
      .Delete(`custompropertydefinition/${id}`)
      .then((res) => {
        return { id, status: res.status } as IEntityRemove;
      });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(`removeFilter: "filter" parameter is required`);

    const customProperties = await this.getFilter(filter);
    return await Promise.all<IEntityRemove>(
      customProperties.map((customProperty: ICustomProperty) => {
        return this.remove(customProperty.id);
      })
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/custompropertydefinition`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  // REVIEW: verify the logic here
  public async update(arg: ICustomPropertyUpdate) {
    if (!arg.id)
      throw new Error(`customPropertyUpdate: "id" parameter is required`);
    if (!arg.name)
      throw new Error(`customPropertyUpdate: "name" parameter is required`);

    let customProperty = await this.get(arg.id);

    if (arg.name) customProperty.name = arg.name;
    if (arg.description) customProperty.description = arg.description;
    if (arg.choiceValues) customProperty.choiceValues = arg.choiceValues;
    if (arg.objectTypes) customProperty.objectTypes = arg.objectTypes;
    if (arg.valueType) customProperty.valueType = arg.valueType;

    customProperty.modifiedDate = modifiedDateTime();

    return await this.repoClient
      .Put(`custompropertydefinition/${arg.id}`, customProperty)
      .then((res) => res.data as ICustomProperty);
  }
}
