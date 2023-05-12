import { QlikRepositoryClient } from "qlik-rest-api";
import {
  IExternalProgramTask,
  ITask,
  ITaskCreateTriggerComposite,
  ITaskCreateTriggerSchema,
  ITaskCreateTriggerCompositeBase,
  ITaskCreateTriggerSchemaBase,
} from "./types/interfaces";
import { IClassSchemaTrigger } from "./SchemaTrigger";
import { IClassCompositeTrigger } from "./CompositeTrigger";
import { CompositeTriggers } from "./CompositeTriggers";
import { SchemaTriggers } from "./SchemaTriggers";

export class ReloadTaskBaseTriggersActions {
  #repoClient: QlikRepositoryClient;
  #taskDetails: ITask | IExternalProgramTask;
  details: (IClassSchemaTrigger | IClassCompositeTrigger)[];
  #compositeTriggers: CompositeTriggers;
  #schemaTriggers: SchemaTriggers;
  constructor(
    repoClient: QlikRepositoryClient,
    taskDetails: ITask | IExternalProgramTask,
    details?: (IClassSchemaTrigger | IClassCompositeTrigger)[]
  ) {
    this.#repoClient = repoClient;
    this.#taskDetails = taskDetails;
    this.#compositeTriggers = new CompositeTriggers(this.#repoClient);
    this.#schemaTriggers = new SchemaTriggers(this.#repoClient);
    this.details = details;
  }

  /**
   * Add task trigger that depends on another task result (success of fail)
   */
  async addComposite(arg: ITaskCreateTriggerCompositeBase) {
    const fullData: ITaskCreateTriggerComposite = {
      ...arg,
      task: { id: this.#taskDetails.id },
    };

    const trigger = await this.#compositeTriggers.create(fullData);

    // TODO: update "details" OR just get all triggers again
    this.details.push(trigger);

    return trigger;
  }

  /**
   * Add task trigger based on schema - daily, weekly, monthly, repeat every X etc.
   */
  async addSchema(arg: ITaskCreateTriggerSchemaBase) {
    const fullData: ITaskCreateTriggerSchema = {
      ...arg,
      task: { id: this.#taskDetails.id },
    };

    const trigger = await this.#schemaTriggers.create(fullData);

    // TODO: update "details" OR just get all triggers again
    this.details.push(trigger);

    return trigger;
  }

  /**
   * Add multiple task triggers in one go. Triggers can be of multiple types - composite and/or schema
   */
  async addMany(
    arg: (ITaskCreateTriggerCompositeBase | ITaskCreateTriggerSchemaBase)[]
  ) {
    const compositeTriggers = (arg as ITaskCreateTriggerCompositeBase[])
      .filter((t) => t.hasOwnProperty("eventTasks"))
      .map((t) => {
        const fullData: ITaskCreateTriggerComposite = {
          ...t,
          task: { id: this.#taskDetails.id },
        };

        return fullData;
      });
    const schemaTriggers = (arg as ITaskCreateTriggerSchemaBase[])
      .filter((t) => t.hasOwnProperty("repeat"))
      .map((t) => {
        const fullData: ITaskCreateTriggerSchema = {
          ...t,
          task: { id: this.#taskDetails.id },
        };

        return fullData;
      });

    const newTriggers = await Promise.all([
      this.#compositeTriggers.createMany(
        compositeTriggers as ITaskCreateTriggerComposite[]
      ),
      this.#schemaTriggers.createMany(
        schemaTriggers as ITaskCreateTriggerSchema[]
      ),
    ]).then((triggers) => triggers.flat());

    // TODO: update "details" OR just get all triggers again
    this.details = [...this.details, ...newTriggers];

    return newTriggers;
  }

  async removeAll() {
    const removeResponses = await Promise.all(
      this.details.map((t) => t.remove())
    );

    this.details = [];

    return removeResponses;
  }
}
