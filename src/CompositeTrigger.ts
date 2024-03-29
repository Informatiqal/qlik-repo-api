import { QlikRepositoryClient } from "qlik-rest-api";

import {
  IEntityRemove,
  ICompositeEvent,
  ITask,
  ITaskUpdateTriggerComposite,
} from "./types/interfaces";

export interface IClassCompositeTrigger {
  remove(): Promise<IEntityRemove>;
  update(arg: ITaskUpdateTriggerComposite): Promise<ICompositeEvent>;
  details: ICompositeEvent;
}

export class CompositeTrigger implements IClassCompositeTrigger {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: ICompositeEvent;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: ICompositeEvent
  ) {
    if (!id)
      throw new Error(`compositeTrigger.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<ICompositeEvent>(`compositeevent/${this.#id}`)
        .then((res) => res.data);
    }
  }

  async remove() {
    return await this.#repoClient
      .Delete(`compositeevent/${this.details.id}`)
      .then((r) => {
        return { id: this.details.id, status: r.status };
      });
  }

  async update(arg: ITaskUpdateTriggerComposite) {
    if (arg.enabled) this.details.enabled = arg.enabled;
    if (arg.name) this.details.name = arg.name;
    if (arg.eventTask) {
      this.details.compositeRules = await Promise.all(
        arg.eventTask.map(async (r) => {
          if (!r.id && !r.name)
            throw new Error(
              `task.createCompositeTrigger: "eventTasks.id" or "eventTasks.name" parameter is required`
            );
          if (!r.state)
            `task.createCompositeTrigger: "eventTasks.state" parameter is required`;

          let ruleState = -1;
          if (r.state == "fail") ruleState = 2;
          if (r.state == "success") ruleState = 1;

          // if task id is specified (ignore the name parameter)
          if (r.id) {
            return {
              reloadTask: {
                id: `${r.id}`,
              },
              ruleState: ruleState,
            };
          }

          // if task id is not specified then find the id based on the provided name
          const task = await this.#repoClient
            .Get<ITask[]>(`task?filter=(name eq '${r.name}')`)
            .then((t) => t.data);

          if (task.length > 1)
            throw new Error(
              `task.createCompositeTrigger: more than one task with name "${r.name}" exists`
            );
          if (task.length == 0)
            throw new Error(
              `task.createCompositeTrigger:task with name "${r.name}" do not exists`
            );

          return {
            id: task[0].id,
            name: task[0].name,
            state: ruleState,
          };
        })
      );
    }

    return await this.#repoClient
      .Post<ICompositeEvent>(`compositeevent/${this.details.id}`, this.details)
      .then((res) => res.data);
  }
}
