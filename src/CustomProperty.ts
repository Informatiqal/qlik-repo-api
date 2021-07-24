import { QlikRepoApi } from "./main";
import { URLBuild } from "./util/generic";

import {
  IHttpStatus,
  ICustomProperty,
  IHttpReturnRemove,
  ICustomPropertyCondensed,
  ISelection,
} from "./interfaces";

import {
  ICustomPropertyCreate,
  ICustomPropertyUpdate,
} from "./interfaces/argument.interface";

import { modifiedDateTime } from "./util/generic";

export class CustomProperty {
  constructor() {}

  public async customPropertyGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<ICustomProperty[] | ICustomPropertyCondensed[]> {
    let url = "custompropertydefinition";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res) => {
      if (!id) return res.data as ICustomPropertyCondensed[];

      return [res.data] as ICustomProperty[];
    });
  }

  public async customPropertyGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<ICustomPropertyCondensed[]> {
    if (!filter)
      throw new Error(
        `customPropertyGetFilter: "filter" parameter is required`
      );

    return await this.repoClient
      .Get(`custompropertydefinition?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ICustomPropertyCondensed[]);
  }

  public async customPropertyCreate(
    this: QlikRepoApi,
    arg: ICustomPropertyCreate
  ) {
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

  public async customPropertyRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id)
      throw new Error(`customPropertyRemove: "id" parameter is required`);

    return await this.repoClient
      .Delete(`custompropertydefinition/${id}`)
      .then((res) => {
        return { id, status: res.status as IHttpStatus } as IHttpReturnRemove;
      });
  }

  public async customPropertySelect(
    this: QlikRepoApi,
    filter?: string
  ): Promise<ISelection> {
    const urlBuild = new URLBuild(`selection/custompropertydefinition`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  // REVIEW: verify the logic here
  public async customPropertyUpdate(
    this: QlikRepoApi,
    arg: ICustomPropertyUpdate
  ) {
    if (!arg.id)
      throw new Error(`customPropertyUpdate: "id" parameter is required`);
    if (!arg.name)
      throw new Error(`customPropertyUpdate: "name" parameter is required`);

    let customProperty = await this.customPropertyGet(arg.id).then(
      (c) => c[0] as ICustomProperty
    );

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
