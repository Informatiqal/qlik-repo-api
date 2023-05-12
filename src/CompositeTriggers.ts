import { QlikRepositoryClient } from "qlik-rest-api";
import {
  ICompositeEvent,
  IEntityRemove,
  ISelection,
  ITask,
  ITaskCreateTriggerComposite,
} from "./types/interfaces";
import { CompositeTrigger } from "./CompositeTrigger";
import { URLBuild } from "./util/generic";

export interface IClassCompositeTriggers {
  get(arg: { id: string }): Promise<CompositeTrigger>;
  getAll(): Promise<CompositeTrigger[]>;
  getFilter(arg: {
    filter: string;
    full?: boolean;
  }): Promise<CompositeTrigger[]>;
  create(arg: ITaskCreateTriggerComposite): Promise<CompositeTrigger>;
  createMany(arg: ITaskCreateTriggerComposite[]): Promise<CompositeTrigger[]>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class CompositeTriggers implements IClassCompositeTriggers {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    const ct: CompositeTrigger = new CompositeTrigger(this.#repoClient, arg.id);
    await ct.init();

    return ct;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<ICompositeEvent[]>(`compositeevent/full`)
      .then((res) => {
        return res.data;
      })
      .then((data) => {
        return data.map((t) => new CompositeTrigger(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `compositeTrigger.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get<ICompositeEvent[]>(
        `compositeevent?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new CompositeTrigger(this.#repoClient, t.id, t));
      });
  }

  public async create(arg: ITaskCreateTriggerComposite) {
    const compositeEvent = await this.createCompositeEventObject(arg);

    return await this.#repoClient
      .Post<ICompositeEvent>(`compositeevent`, compositeEvent)
      .then((res) => res.data)
      .then((t) => new CompositeTrigger(this.#repoClient, t.id, t));
  }

  public async createMany(arg: ITaskCreateTriggerComposite[]) {
    const compositeEvents = await Promise.all(
      arg.map((a) => this.createCompositeEventObject(a))
    );

    return await this.#repoClient
      .Post<ICompositeEvent[]>(`compositeevent/many`, compositeEvents)
      .then((res) => res.data)
      .then((triggers) =>
        triggers.map((t) => new CompositeTrigger(this.#repoClient, t.id, t))
      );
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `compositeTrigger.removeFilter: "filter" parameter is required`
      );

    const triggers = await this.getFilter({ filter: arg.filter });
    if (triggers.length == 0)
      throw new Error(
        `compositeTriggers.removeFilter: filter query return 0 items`
      );

    return await Promise.all<IEntityRemove>(
      triggers.map((ct) =>
        ct.remove().then((s) => ({ id: ct.details.id, status: s.status }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/compositeevent`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  private checkCreateData(arg: ITaskCreateTriggerComposite) {
    if (!arg.task)
      throw new Error(`compositeTrigger.create: "task" is required`);

    if (!arg.name)
      throw new Error(`compositeTrigger.create: "name" is required`);

    const eventsWithoutTasks = arg.eventTasks.filter(
      (ev) => !ev.id && !ev.filter
    );

    if (eventsWithoutTasks.length > 0)
      throw new Error(
        `compositeTriggers.create: "eventTasks.id" or "eventTasks.name" parameter is required`
      );

    const eventsWithoutState = arg.eventTasks.filter((ev) => !ev.state);
    if (eventsWithoutState.length > 0)
      `compositeTriggers.create: "eventTasks.state" parameter is required`;

    const eventsWithWrongState = arg.eventTasks.filter(
      (ev) => ev.state != "fail" && ev.state != "success"
    );
    if (eventsWithWrongState.length > 0)
      throw new Error(
        `compositeTriggers.create: "eventTasks.state" value must be "success" or "fail"`
      );

    return;
  }

  /**
   * From given ID or Filter get the task type and ID
   */
  private async getTaskTypeAndId(arg: {
    id?: string;
    filter?: string;
  }): Promise<{ id: string; type: string }> {
    const details = {
      type: "",
      id: "",
    };

    const filter = arg.id ? `id eq ${arg.id}` : arg.filter;

    const tasks = await this.#repoClient
      .Get<ITask[]>(`task?filter=(${filter})`)
      .then((t) => t.data);

    if (tasks.length > 1)
      throw new Error(
        `compositeTriggers.create: more than one task with filter "${arg.filter}" exists`
      );

    if (tasks.length == 0)
      throw new Error(`compositeTriggers.create: task do not exists`);

    const taskTypes = {
      0: "reloadTask",
      1: "externalProgramTask",
      2: "userSyncTask",
    };

    details.type = taskTypes[tasks[0].taskType];
    details.id = tasks[0].id;

    return details;
  }

  private async createCompositeEventObject(ev: ITaskCreateTriggerComposite) {
    // first check if the passed data is missing something
    this.checkCreateData(ev);

    const compositeEvent = {
      name: ev.name,
      enabled: ev.hasOwnProperty("enabled") ? ev.enabled : true,
      compositeRules: [],
      timeConstraint: ev.timeConstraint
        ? ev.timeConstraint
        : {
            days: 0,
            hours: 0,
            minutes: 360,
            seconds: 0,
          },
      eventType: 1,
    };

    const t = await this.getTaskTypeAndId(ev.task);
    compositeEvent[t.type] = { id: t.id };

    const eventTasks = await Promise.all(
      ev.eventTasks.map(async (r) => {
        let ruleState = -1;
        if (r.state == "fail") ruleState = 2;
        if (r.state == "success") ruleState = 1;

        const b = await this.getTaskTypeAndId({ id: r.id, filter: r.filter });

        const c = {
          ruleState,
        };

        c[b.type] = { id: b.id };

        return c;
      })
    );

    compositeEvent.compositeRules = eventTasks;

    return compositeEvent;
  }
}
