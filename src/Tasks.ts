import { QlikRepositoryClient } from "qlik-rest-api";
import { ITask } from "./types/interfaces";
import { IClassTask, Task } from "./Task";

export interface IClassTasks {
  get(arg: { id: string }): Promise<IClassTask>;
  getAll(): Promise<IClassTask[]>;
  getFilter(arg: { filter: string }): Promise<IClassTask[]>;
}

export class Tasks implements IClassTasks {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    const task: Task = new Task(this.#repoClient, arg.id);
    await task.init();

    return task;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<ITask[]>(`task/full`)
      .then((res) => {
        return res.data;
      })
      .then((data) => {
        return data.map((t) => new Task(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`tasks.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get<ITask[]>(`task?filter=(${encodeURIComponent(arg.filter)})`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new Task(this.#repoClient, t.id, t));
      });
  }
}
