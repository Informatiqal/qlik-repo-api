import { QlikRepositoryClient } from "qlik-rest-api";
import { IHttpReturn, ITask } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";

export interface IClassTask {
  start(): Promise<IHttpStatus>;
  startSynchronous(): Promise<IHttpReturn>;
  stop(): Promise<IHttpStatus>;
  details: ITask;
}

export class Task implements IClassTask {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: ITask;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: ITask) {
    if (!id) throw new Error(`tasks.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<ITask[]>(`task/full?filter=(id eq ${this.#id})`)
        .then((res) => {
          if (res.data.length == 0)
            throw new Error(
              `tasks.get: task with id "${this.#id}" was not found`
            );

          return res.data[0];
        });
    }
  }

  async start() {
    return await this.#repoClient
      .Post(`task/${this.#id}/start`, {})
      .then((res) => res.status);
  }

  async startSynchronous() {
    return await this.#repoClient.Post(
      `task/${this.#id}/start/synchronous`,
      {}
    );
  }

  async stop() {
    return await this.#repoClient
      .Post(`task/${this.#id}/stop`, {})
      .then((res) => res.status);
  }
}
