import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { ITask, ITaskCreate } from "./Task.interface";

import { IClassReloadTask } from "./ReloadTaskBase";
import { ExternalTask } from "./ExternalTask";

//TODO: why is no update method here?
export interface IClassExternalTasks {
  get(arg: { id: string }): Promise<IClassReloadTask>;
  getAll(): Promise<IClassReloadTask[]>;
  getFilter(arg: { filter: string }): Promise<IClassReloadTask[]>;
  count(arg?: { filter: string }): Promise<number>;
  select(arg?: { filter: string }): Promise<ISelection>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  create(arg: ITaskCreate): Promise<IClassReloadTask>;
}

export class ExternalTasks implements IClassExternalTasks {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`reloadTasks.get: "id" parameter is required`);

    const extTask: ExternalTask = new ExternalTask(this.#repoClient, arg.id);
    await extTask.init();

    return extTask;
  }

  public async getAll() {
    return await this.#repoClient
      .Get(`externalprogramtask/full`)
      .then((res) => res.data as ITask[])
      .then((data) => {
        return data.map((t) => {
          return new ExternalTask(this.#repoClient, t.id, t);
        });
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`reloadTasks.getFilter: "path" parameter is required`);

    return await this.#repoClient
      .Get(
        `externalprogramtask/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data as ITask[])
      .then((data) => {
        return data.map((t) => {
          return new ExternalTask(this.#repoClient, t.id, t);
        });
      });
  }

  public async count(arg?: { filter: string }) {
    let url: string = `externalprogramtask/count`;
    if (arg.filter) url += `${url}?filter=(${encodeURIComponent(arg.filter)})`;

    return await this.#repoClient
      .Get(`${url}`)
      .then((res) => res.data.value as number);
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `reloadTasks.removeFilter: "filter" parameter is required`
      );

    const tasks = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      tasks.map((task: IClassReloadTask) =>
        task.remove().then((s) => ({ id: task.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/externalprogramtask`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async create(arg: ITaskCreate) {
    if (!arg.appId)
      throw new Error(`task.create: "appId" parameter is required`);
    if (!arg.name) throw new Error(`task.create: "name" parameter is required`);

    let reloadTask: { [k: string]: any } = {};

    reloadTask["schemaEvents"] = [];
    reloadTask["compositeEvents"] = [];
    reloadTask["task"] = {
      name: arg.name,
      app: { id: arg.appId },
      taskType: 0,
      enabled: true,
      taskSessionTimeout: 1440,
      maxRetries: 0,
      isManuallyTriggered: false,
      tags: [],
      customProperties: [],
    };

    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      reloadTask,
      arg
    );
    reloadTask = await updateCommon.updateAll();

    reloadTask.task.customProperties = (reloadTask as any).customProperties;
    reloadTask.task.tags = (reloadTask as any).tags;

    delete (reloadTask as any).modifiedDate;
    delete (reloadTask as any).customProperties;
    delete (reloadTask as any).tags;

    return await this.#repoClient
      .Post(`reloadtask/create`, { ...reloadTask })
      .then((res) => res.data as ITask)
      .then((t) => new ExternalTask(this.#repoClient, t.id, t));
  }
}
