import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import {
  IEntityRemove,
  ISelection,
  IExecutionResult,
  IExecutionResultDetail,
} from "./types/interfaces";
import { ExecutionResult } from "./ExecutionResult";
import { ExecutionResultDetail } from "./ExecutionResultDetail";
import { ExecutionResultDetails } from "./ExecutionResultDetails";

export interface IClassExecutionResults {
  get(arg: { id: string }): Promise<ExecutionResult>;
  getAll(): Promise<ExecutionResult[]>;
  getFilter(arg: {
    filter: string;
    full?: boolean;
  }): Promise<ExecutionResult[]>;
  count(): Promise<number>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class ExecutionResults implements IClassExecutionResults {
  #repoClient: QlikRepositoryClient;
  executionResultDetails: ExecutionResultDetails;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
    this.executionResultDetails = new ExecutionResultDetails(this.#repoClient);
  }

  public async get(arg: { id: string }) {
    const executionResult: ExecutionResult = new ExecutionResult(
      this.#repoClient,
      arg.id
    );
    await executionResult.init();

    return executionResult;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IExecutionResult[]>(`executionresult/full`)
      .then((res) => {
        return res.data;
      })
      .then((data) => {
        return data.map((t) => new ExecutionResult(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `executionresult.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get<IExecutionResult[]>(
        `executionresult?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new ExecutionResult(this.#repoClient, t.id, t));
      });
  }

  public async count() {
    return await this.#repoClient
      .Get<{ value: number }>(`executionresult/count`)
      .then((res) => res.data.value);
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `executionresult.removeFilter: "filter" parameter is required`
      );

    const executionResults = await this.getFilter({ filter: arg.filter });
    if (executionResults.length == 0)
      throw new Error(
        `executionResult.removeFilter: filter query return 0 items`
      );

    return await Promise.all<IEntityRemove>(
      executionResults.map((executionResult) =>
        executionResult
          .remove()
          .then((s) => ({ id: executionResult.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/executionresult`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  // public async detailsAll() {
  //   return await this.#repoClient
  //     .Get<IExecutionResultDetail[]>(`executionresult/detail/full`)
  //     .then((res) => res.data)
  //     .then((data) => {
  //       return data.map(
  //         (t) => new ExecutionResultDetail(this.#repoClient, t.id, t)
  //       );
  //     });
  // }

  // public async detailsFilter() {
  //   return await this.#repoClient
  //     .Get<IExecutionResultDetail[]>(`executionresult/detail/full`)
  //     .then((res) => res.data)
  //     .then((data) => {
  //       return data.map(
  //         (t) => new ExecutionResultDetail(this.#repoClient, t.id, t)
  //       );
  //     });
  // }
}
