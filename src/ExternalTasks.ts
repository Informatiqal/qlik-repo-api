import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import {
  IEntityRemove,
  ISelection,
  IExternalTaskCreate,
  IExternalProgramTask,
} from "./types/interfaces";

import { ReloadTaskBase } from "./ReloadTaskBase";
import { ExternalTask } from "./ExternalTask";

export interface IClassExternalTask extends ReloadTaskBase {}

//TODO: why is no update method here?
export interface IClassExternalTasks {
  get(arg: { id: string }): Promise<IClassExternalTask>;
  getAll(): Promise<IClassExternalTask[]>;
  getFilter(arg: { filter: string }): Promise<IClassExternalTask[]>;
  count(arg?: { filter: string }): Promise<number>;
  select(arg?: { filter: string }): Promise<ISelection>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  create(arg: IExternalTaskCreate): Promise<IClassExternalTask>;
}

export class ExternalTasks implements IClassExternalTasks {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id)
      throw new Error(`externalTasks.get: "id" parameter is required`);

    const extTask: ExternalTask = new ExternalTask(this.#repoClient, arg.id);
    await extTask.init();

    return extTask;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IExternalProgramTask[]>(`externalprogramtask/full`)
      .then((res) => res.data)
      .then(async (data) => {
        return await Promise.all(
          data.map(async (t) => {
            const task = new ExternalTask(this.#repoClient, t.id, t);
            await task.init();

            return task;
          })
        );
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`externalTasks.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get<IExternalProgramTask[]>(
        `externalprogramtask/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then(async (data) => {
        return Promise.all(
          data.map(async (t) => {
            const task = new ExternalTask(this.#repoClient, t.id, t);
            await task.init();

            return task;
          })
        );
      });
  }

  public async count(arg?: { filter: string }) {
    let url: string = `externalprogramtask/count`;
    if (arg.filter) url += `${url}?filter=(${encodeURIComponent(arg.filter)})`;

    return await this.#repoClient
      .Get<{ value: number }>(`${url}`)
      .then((res) => res.data.value);
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `externalTasks.removeFilter: "filter" parameter is required`
      );

    const tasks = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      tasks.map((task: IClassExternalTask) =>
        task.remove().then((s) => ({ id: task.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/externalprogramtask`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async create(arg: IExternalTaskCreate) {
    if (!arg.path)
      throw new Error(`externalTask.create: "path" parameter is required`);
    if (!arg.name)
      throw new Error(`externalTask.create: "name" parameter is required`);

    let externalTask: { [k: string]: any } = {};

    // externalTask["schemaEvents"] = [];
    // externalTask["compositeEvents"] = [];
    externalTask = {
      name: arg.name,
      path: arg.path,
      parameters: arg.parameters,
      taskType: 1,
      enabled: true,
      taskSessionTimeout: 1440,
      maxRetries: 0,
      tags: [],
      customProperties: [],
    };

    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      externalTask,
      arg
    );
    externalTask = await updateCommon.updateAll();

    externalTask.customProperties = (externalTask as any).customProperties;
    externalTask.tags = (externalTask as any).tags;

    delete (externalTask as any).modifiedDate;
    delete (externalTask as any).customProperties;
    delete (externalTask as any).tags;

    return await this.#repoClient
      .Post(`externalprogramtask`, { ...externalTask })
      .then((res) => res.data as IExternalProgramTask)
      .then(async (t) => {
        const et = new ExternalTask(this.#repoClient, t.id, t);
        await et.init();

        return et;
      });
  }
}
