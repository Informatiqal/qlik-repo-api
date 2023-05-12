import { QlikGenericRestClient, QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import {
  IEntityRemove,
  IReloadTaskBundle,
  ISelection,
  ITask,
  ITaskCreate,
} from "./types/interfaces";

import { ReloadTask } from "./ReloadTask";
import { getAppForReloadTask } from "./util/ReloadTaskUtil";

//TODO: why is no update method here?
export interface IClassReloadTasks {
  get(arg: { id: string }): Promise<ReloadTask>;
  getAll(): Promise<ReloadTask[]>;
  getFilter(arg: { filter: string }): Promise<ReloadTask[]>;
  count(arg?: { filter: string }): Promise<number>;
  select(arg?: { filter: string }): Promise<ISelection>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  create(arg: ITaskCreate): Promise<ReloadTask>;
}

export class ReloadTasks implements IClassReloadTasks {
  #repoClient: QlikRepositoryClient;
  #genericClient: QlikGenericRestClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`reloadTasks.get: "id" parameter is required`);

    const reloadTask: ReloadTask = new ReloadTask(this.#repoClient, arg.id);
    await reloadTask.init();

    return reloadTask;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<ITask[]>(`reloadtask/full`)
      .then((res) => res.data)
      .then(async (data) => {
        return await Promise.all(
          data.map(async (t) => {
            const task = new ReloadTask(this.#repoClient, t.id, t);
            await task.init();

            return task;
          })
        );
      });
  }

  // "funny story" but tasks are slightly different from the rest
  // not only their data must be init but also all the data for the
  // triggers will have to be init at the same time
  // for this reason we cant return only the instance (new ReloadTask)
  // but actually have to call the init() method for each task
  // this way when the task returned it will have
  // triggersDetails populated
  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`reloadTasks.getFilter: "path" parameter is required`);

    return await this.#repoClient
      .Get<ITask[]>(
        `reloadtask/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then(async (data) => {
        return await Promise.all(
          data.map(async (t) => {
            const task = new ReloadTask(this.#repoClient, t.id, t);
            await task.init();

            return task;
          })
        );
      });
    // .then(async (rt) => {
    //   return await Promise.all<ReloadTask>(
    //     rt.map((r) => {
    //       return r.init().then((r1) => r);
    //     })
    //   );
    // })
    // .then((r) => r);
  }

  public async count(arg?: { filter: string }) {
    let url: string = `reloadtask/count`;
    if (arg.filter) url += `${url}?filter=(${encodeURIComponent(arg.filter)})`;

    return await this.#repoClient
      .Get<{ value: number }>(`${url}`)
      .then((res) => res.data.value);
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `reloadTasks.removeFilter: "filter" parameter is required`
      );

    const tasks = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      tasks.map((task) =>
        task.remove().then((s) => ({ id: task.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/reloadtask`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async create(arg: ITaskCreate) {
    if (!arg.name) throw new Error(`task.create: "name" parameter is required`);

    const app = await getAppForReloadTask(
      arg.appId,
      arg.appFilter,
      this.#repoClient
    );

    let reloadTask: IReloadTaskBundle = {
      schemaEvents: [],
      compositeEvents: [],
      task: {
        tags: [],
        customProperties: [],
        app: { id: app.details.id },
        name: arg.name,
        taskType: 0,
        enabled: true,
        taskSessionTimeout: 1440,
        maxRetries: 0,
      },
    };

    const updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      reloadTask,
      arg
    );

    reloadTask = await updateCommon.updateAll();

    // reloadTask.task.customProperties = reloadTask.customProperties;
    // reloadTask.task.tags = (reloadTask as any).tags;

    // delete (reloadTask as any).modifiedDate;
    // delete (reloadTask as any).customProperties;
    // delete (reloadTask as any).tags;

    return await this.#repoClient
      .Post<ITask>(`reloadtask/create`, { ...reloadTask })
      .then((res) => res.data)
      .then(async (t) => {
        const rt = new ReloadTask(this.#repoClient, t.id, t);
        await rt.init();

        return rt;
      });
  }
}
