import { QlikRepositoryClient } from "qlik-rest-api";
import {
  IEntityRemove,
  ISchemaEvent,
  ISelection,
  ITask,
  ITaskCreateTriggerSchema,
} from "./types/interfaces";
import { SchemaTrigger } from "./SchemaTrigger";
import { URLBuild } from "./util/generic";
import { schemaRepeat } from "./util/schemaTrigger";

export class SchemaTriggers {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }): Promise<SchemaTrigger> {
    const ct: SchemaTrigger = new SchemaTrigger(this.#repoClient, arg.id);
    await ct.init();

    return ct;
  }

  public async getAll(): Promise<SchemaTrigger[]> {
    return await this.#repoClient
      .Get<ISchemaEvent[]>(`schemaevent/full`)
      .then((res) => {
        return res.data;
      })
      .then((data) => {
        return data.map((t) => new SchemaTrigger(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }): Promise<SchemaTrigger[]> {
    if (!arg.filter)
      throw new Error(
        `compositeTrigger.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get<ISchemaEvent[]>(
        `schemaevent/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new SchemaTrigger(this.#repoClient, t.id, t));
      });
  }

  public async create(arg: ITaskCreateTriggerSchema): Promise<SchemaTrigger> {
    if (!arg.name)
      throw new Error(`schemaTrigger.create: "name" parameter is required`);

    const createObj = await this.createSchemaEventObject(arg);

    return await this.#repoClient
      .Post<ISchemaEvent>(`schemaevent`, { ...createObj })
      .then((res) => res.data)
      .then((t) => new SchemaTrigger(this.#repoClient, t.id, t));
  }

  public async createMany(
    arg: ITaskCreateTriggerSchema[]
  ): Promise<SchemaTrigger[]> {
    const events = await Promise.all(
      arg.map(async (s) => {
        return await this.createSchemaEventObject(s);
      })
    );

    return await this.#repoClient
      .Post<ISchemaEvent[]>(`schemaevent/many`, events)
      .then((res) => res.data)
      .then((triggers) =>
        triggers.map((t) => new SchemaTrigger(this.#repoClient, t.id, t))
      );
  }

  public async removeFilter(arg: { filter: string }): Promise<IEntityRemove[]> {
    if (!arg.filter)
      throw new Error(
        `schemaTrigger.removeFilter: "filter" parameter is required`
      );

    const triggers = await this.getFilter({ filter: arg.filter });
    if (triggers.length == 0)
      throw new Error(
        `schemaTriggers.removeFilter: filter query return 0 items`
      );

    return await Promise.all<IEntityRemove>(
      triggers.map((st) =>
        st.remove().then((s) => ({ id: st.details.id, status: s.status }))
      )
    );
  }

  public async select(arg?: { filter: string }): Promise<ISelection> {
    const urlBuild = new URLBuild(`selection/schemaevent`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
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

  private async createSchemaEventObject(s: ITaskCreateTriggerSchema) {
    const currentTimeStamp = new Date();

    const schemaRepeatOpt = schemaRepeat(
      s.repeat || "Daily",
      s.repeatEvery || 1,
      s.daysOfWeek || ["Monday"],
      s.daysOfMonth || [1]
    );

    let daylightSaving = 0;
    if (s.daylightSavingTime) {
      const mapping = {
        ObserveDaylightSavingTime: 0,
        PermanentStandardTime: 1,
        PermanentDaylightSavingTime: 2,
      };

      if (!mapping.hasOwnProperty(s.daylightSavingTime))
        throw new Error(
          `compositeTrigger.create: invalid value for "daylightSavingTime". Valid values are: ObserveDaylightSavingTime, PermanentStandardTime, PermanentDaylightSavingTime. Provided was "${s.daylightSavingTime}`
        );

      daylightSaving = mapping[s.daylightSavingTime];
    }

    const eventObj: { [k: string]: any } = {};
    eventObj["name"] = s.name;
    eventObj["timeZone"] = s.timeZone || "UTC";
    eventObj["daylightSavingTime"] = daylightSaving;
    eventObj["startDate"] = s.startDate || currentTimeStamp.toISOString();
    eventObj["expirationDate"] = s.expirationDate || "9999-01-01T00:00:00.000";
    eventObj["schemaFilterDescription"] = [schemaRepeatOpt.schemaFilterDescr];
    eventObj["incrementDescription"] = schemaRepeatOpt.incrementDescr;
    eventObj["incrementOption"] = 1;
    eventObj["eventType"] = 0;
    eventObj["enabled"] = s.hasOwnProperty("enabled") ? s.enabled : true;

    const t = await this.getTaskTypeAndId(s.task);
    eventObj[t.type] = { id: t.id };

    return eventObj;
  }
}
