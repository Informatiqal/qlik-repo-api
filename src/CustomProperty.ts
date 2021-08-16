import { QlikRepositoryClient } from "qlik-rest-api";
import { modifiedDateTime } from "./util/generic";
import { IHttpStatus } from "./types/interfaces";
import { ICustomProperty, ICustomPropertyUpdate } from "./CustomProperties";

export interface IClassCustomProperty {
  remove(): Promise<IHttpStatus>;
  update(arg: ICustomPropertyUpdate): Promise<IHttpStatus>;
  details: ICustomProperty;
}

export class CustomProperty implements IClassCustomProperty {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: ICustomProperty;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: ICustomProperty
  ) {
    if (!id) throw new Error(`tags.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`custompropertydefinition/${this.id}`)
        .then((res) => res.data as ICustomProperty);
    }
  }

  public async remove() {
    return await this.repoClient
      .Delete(`custompropertydefinition/${this.id}`)
      .then((res) => res.status);
  }

  // REVIEW: verify the logic here
  public async update(arg: ICustomPropertyUpdate) {
    if (!arg.id)
      throw new Error(`customProperty.update: "id" parameter is required`);
    if (!arg.name)
      throw new Error(`customProperty.update: "name" parameter is required`);

    if (arg.name) this.details.name = arg.name;
    if (arg.description) this.details.description = arg.description;
    if (arg.choiceValues) this.details.choiceValues = arg.choiceValues;
    if (arg.objectTypes) this.details.objectTypes = arg.objectTypes;
    if (arg.valueType) this.details.valueType = arg.valueType;

    this.details.modifiedDate = modifiedDateTime();

    return await this.repoClient
      .Put(`custompropertydefinition/${arg.id}`, this.details)
      .then((res) => res.status);
  }
}
