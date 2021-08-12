import { QlikRepositoryClient } from "qlik-rest-api";
import { ISchemaEvent, ISelectionEvent } from "./Task.interface";
import { IEntityRemove } from "./types/interfaces";

export interface IClassSchemaTrigger {
  remove(): Promise<IEntityRemove>;
  details: ISchemaEvent;
}

export class SchemaTrigger implements IClassSchemaTrigger {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: ISchemaEvent;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: ISchemaEvent
  ) {
    if (!id) throw new Error(`tags.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details as ISchemaEvent;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`schemaevent/${this.id}`)
        .then((res) => res.data as ISchemaEvent);
    }
  }

  async remove() {
    return await this.repoClient
      .Delete(`schemaevent/${this.details.id}`)
      .then((r) => {
        return { id: this.details.id, status: r.status } as IEntityRemove;
      });
  }
}
