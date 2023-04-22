import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild, uuid } from "./util/generic";
import {
  IEntityRemove,
  ISelection,
  IExecutionResultDetail,
  IExecutionResultDetailCreate,
} from "./types/interfaces";
import { ExecutionResultDetail } from "./ExecutionResultDetail";

export interface IClassExecutionResultDetails {
  get(arg: { id: string }): Promise<ExecutionResultDetail>;
  getAll(): Promise<ExecutionResultDetail[]>;
  getFilter(arg: {
    filter: string;
    full?: boolean;
  }): Promise<ExecutionResultDetail[]>;
  count(): Promise<number>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
  create(arg: IExecutionResultDetailCreate): Promise<ExecutionResultDetail>;
  createMany(
    arg: IExecutionResultDetailCreate[]
  ): Promise<ExecutionResultDetail[]>;
}

export class ExecutionResultDetails implements IClassExecutionResultDetails {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    const executionResult: ExecutionResultDetail = new ExecutionResultDetail(
      this.#repoClient,
      arg.id
    );
    await executionResult.init();

    return executionResult;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IExecutionResultDetail[]>(`executionresult/detail/full`)
      .then((res) => {
        return res.data;
      })
      .then((data) => {
        return data.map(
          (t) => new ExecutionResultDetail(this.#repoClient, t.id, t)
        );
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `executionresultDetails.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get<IExecutionResultDetail[]>(
        `executionresult/detail/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map(
          (t) => new ExecutionResultDetail(this.#repoClient, t.id, t)
        );
      });
  }

  public async count() {
    return await this.#repoClient
      .Get<{ value: number }>(`executionresult/detail/count`)
      .then((res) => res.data.value);
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `executionresultDetails.removeFilter: "filter" parameter is required`
      );

    const executionResultDetails = await this.getFilter({ filter: arg.filter });
    if (executionResultDetails.length == 0)
      throw new Error(
        `executionResultDetails.removeFilter: filter query return 0 items`
      );

    return await Promise.all<IEntityRemove>(
      executionResultDetails.map((executionResultDetail) =>
        executionResultDetail
          .remove()
          .then((s) => ({ id: executionResultDetail.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/executionresult/detail`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async create(arg: IExecutionResultDetailCreate) {
    return await this.#repoClient
      .Post<IExecutionResultDetail>(`/executionresult/detail`, {
        ...arg,
        id: uuid(),
      })
      .then((res) => res.data)
      .then((t) => new ExecutionResultDetail(this.#repoClient, t.id, t));
  }

  public async createMany(arg: IExecutionResultDetailCreate[]) {
    return await this.#repoClient
      .Post<IExecutionResultDetail[]>(
        `/executionresult/detail/many`,
        arg.map((a) => ({
          ...a,
          id: uuid(),
        }))
      )
      .then((res) => res.data)
      .then((results) => {
        return results.map(
          (result) =>
            new ExecutionResultDetail(this.#repoClient, result.id, result)
        );
      });
  }
}
