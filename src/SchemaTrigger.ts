import { QlikRepositoryClient } from "qlik-rest-api";
import {
  IEntityRemove,
  ISchemaEvent,
  ITaskUpdateTriggerSchema,
} from "./types/interfaces";
import { schemaRepeat } from "./util/schemaTrigger";

export interface IClassSchemaTrigger {
  remove(): Promise<IEntityRemove>;
  update(arg: ITaskUpdateTriggerSchema): Promise<ISchemaEvent>;
  details: ISchemaEvent;
}

export class SchemaTrigger implements IClassSchemaTrigger {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: ISchemaEvent;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: ISchemaEvent
  ) {
    if (!id) throw new Error(`schemaTrigger.get: "id" parameter is required`);

    this.details = {} as ISchemaEvent;
    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<ISchemaEvent>(`schemaevent/${this.#id}`)
        .then((res) => res.data);
    }
  }

  async remove() {
    return await this.#repoClient
      .Delete(`schemaevent/${this.details.id}`)
      .then((r) => {
        return { id: this.details.id ?? "", status: r.status };
      });
  }

  async update(arg: ITaskUpdateTriggerSchema) {
    if (arg.enabled !== undefined) this.details.enabled = arg.enabled;
    if (arg.name) this.details.name = arg.name;
    if (arg.startDate) this.details.startDate = arg.startDate;
    if (arg.expirationDate) this.details.expirationDate = arg.expirationDate;
    if (arg.timeZone) this.details.timeZone = arg.timeZone;
    if (arg.daylightSavingTime)
      this.details.daylightSavingTime = arg.daylightSavingTime ? 1 : 0;

    let schemaRepeatOpt = schemaRepeat(
      arg.repeat || "Daily",
      arg.repeatEvery || 1,
      arg.daysOfWeek || ["Monday"],
      arg.daysOfMonth || [1]
    );

    if (arg.repeat || arg.repeatEvery || arg.daysOfWeek || arg.daysOfMonth) {
      this.details.schemaFilterDescription = [
        schemaRepeatOpt.schemaFilterDescr,
      ];
      this.details.incrementDescription = schemaRepeatOpt.incrementDescr;
    }

    return await this.#repoClient
      .Put<ISchemaEvent>(`schemaevent/${this.details.id}`, this.details)
      .then((res) => res.data);
  }
}
