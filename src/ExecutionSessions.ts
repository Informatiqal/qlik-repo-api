import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import {
  IEntityRemove,
  ISelection,
  IExecutionSession,
} from "./types/interfaces";
import { ExecutionSession } from "./ExecutionSession";

export interface IClassExecutionSessions {
  get(arg: { id: string }): Promise<ExecutionSession>;
  getAll(): Promise<ExecutionSession[]>;
  getFilter(arg: {
    filter: string;
    full?: boolean;
  }): Promise<ExecutionSession[]>;
  count(): Promise<number>;
  select(arg?: { filter: string }): Promise<ISelection>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
}

export class ExecutionSessions implements IClassExecutionSessions {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    const executionSession: ExecutionSession = new ExecutionSession(
      this.#repoClient,
      arg.id
    );
    await executionSession.init();

    return executionSession;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IExecutionSession[]>(`executionsession/full`)
      .then((res) => {
        return res.data;
      })
      .then((data) => {
        return data.map((t) => new ExecutionSession(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `executionsessions.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get<IExecutionSession[]>(
        `executionsession?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new ExecutionSession(this.#repoClient, t.id, t));
      });
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `executionsessions.removeFilter: "filter" parameter is required`
      );

    const executionsessions = await this.getFilter({ filter: arg.filter });
    if (executionsessions.length == 0)
      throw new Error(
        `executionsessions.removeFilter: filter query return 0 items`
      );

    return await Promise.all<IEntityRemove>(
      executionsessions.map((executionsession) =>
        executionsession
          .remove()
          .then((s) => ({ id: executionsession.details.id, status: s }))
      )
    );
  }

  public async count() {
    return await this.#repoClient
      .Get<{ value: number }>(`executionsession/count`)
      .then((res) => res.data.value);
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/executionsession`);
    urlBuild.addParam("filter", arg?.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }
}
