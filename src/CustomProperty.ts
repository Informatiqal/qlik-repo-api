import { QlikRepoApi } from "./main";

import {
  IHttpStatus,
  ICustomProperty,
  IHttpReturnRemove,
  ICustomPropertyCondensed,
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
    id: string
  ): Promise<ICustomProperty> {
    return await this.repoClient
      .Get(`custompropertydefinition/${id}`)
      .then((res) => res.data as ICustomProperty);
  }

  public async customPropertyGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<ICustomPropertyCondensed[]> {
    return await this.repoClient
      .Get(`custompropertydefinition?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ICustomPropertyCondensed[]);
  }

  public async customPropertyCreate(
    this: QlikRepoApi,
    arg: ICustomPropertyCreate
  ) {
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
    return await this.repoClient
      .Delete(`custompropertydefinition/${id}`)
      .then((res) => {
        return { id, status: res.status as IHttpStatus } as IHttpReturnRemove;
      });
  }

  public async customPropertyUpdate(
    this: QlikRepoApi,
    arg: ICustomPropertyUpdate
  ) {
    let customProperty = await this.customPropertyGet(arg.id);

    if (arg.name) customProperty.name = arg.name;
    if (arg.description) customProperty.description = arg.description;
    if (arg.choiceValues) customProperty.choiceValues = arg.choiceValues;
    if (arg.objectTypes) customProperty.objectTypes = arg.objectTypes;
    if (arg.valueType) customProperty.valueType = arg.valueType;
    if (arg.modifiedByUserName)
      customProperty.modifiedByUserName = arg.modifiedByUserName;

    customProperty.modifiedDate = modifiedDateTime();

    return await this.repoClient
      .Put(`custompropertydefinition/${arg.id}`, customProperty)
      .then((res) => res.data as ICustomProperty);
  }
}
