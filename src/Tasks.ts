import { QlikRepositoryClient } from "qlik-rest-api";
import { ITask } from "./Task.interface";
import { IClassTask, Task } from "./Task";

export interface IClassTasks {
  get(id: string): Promise<IClassTask>;
  getAll(): Promise<IClassTask[]>;
  getFilter(filter: string): Promise<IClassTask[]>;
}

export class Tasks implements IClassTasks {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    const task: Task = new Task(this.repoClient, id);
    await task.init();

    return task;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`task/full`)
      .then((res) => {
        return res.data as ITask[];
      })
      .then((data) => {
        return data.map((t) => {
          return new Task(this.repoClient, t.id, t);
        });
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`tasks.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`tasks?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITask[])
      .then((data) => {
        return data.map((t) => {
          return new Task(this.repoClient, t.id, t);
        });
      });
  }
}
