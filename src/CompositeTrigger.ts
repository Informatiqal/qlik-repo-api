import { QlikRepositoryClient } from "qlik-rest-api";
import {
  ICompositeEvent,
  ITask,
  ITaskUpdateTriggerComposite,
} from "./Task.interface";
import { IEntityRemove } from "./types/interfaces";

export interface IClassCompositeTrigger {
  remove(): Promise<IEntityRemove>;
  update(arg: ITaskUpdateTriggerComposite): Promise<IEntityRemove>;
  details: ICompositeEvent;
}

export class CompositeTrigger implements IClassCompositeTrigger {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: ICompositeEvent;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: ICompositeEvent
  ) {
    if (!id)
      throw new Error(`compositeTrigger.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details as ICompositeEvent;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`compositeevent/${this.id}`)
        .then((res) => res.data as ICompositeEvent);
    }
  }

  async remove() {
    return await this.repoClient
      .Delete(`compositeevent/${this.details.id}`)
      .then((r) => {
        return { id: this.details.id, status: r.status } as IEntityRemove;
      });
  }

  async update(arg: ITaskUpdateTriggerComposite) {
    if (arg.enabled) this.details.enabled = arg.enabled;
    if (arg.name) this.details.name = arg.name;
    if (arg.eventTasks) {
      this.details.compositeRules = await Promise.all(
        arg.eventTasks.map(async (r) => {
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
          const task = await this.repoClient
            .Get(`task?filter=(name eq '${r.name}')`)
            .then((t) => t.data as ITask[]);

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

    return await this.repoClient
      .Post(`compositeevent/${this.details.id}`, this.details)
      .then((res) => {
        return {
          id: this.details.id,
          status: res.status,
        };
      });
  }
}
