import { QlikRepositoryClient } from "qlik-rest-api";
import { modifiedDateTime } from "./util/generic";
import { ExecutionResultDetail } from "./ExecutionResultDetail";
import { IExecutionResult } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";

export interface IClassExecutionResult {
  remove(): Promise<IHttpStatus>;
  update(arg: { name: string }): Promise<IExecutionResult>;
  details: IExecutionResult;
}

export class ExecutionResult implements IClassExecutionResult {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IExecutionResult;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IExecutionResult
  ) {
    if (!id) throw new Error(`executionResult.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) {
      if (details.details.length > 0) {
        // TODO: "as any" should not be used here
        details.details = details.details.map(
          (d) =>
            new ExecutionResultDetail(this.#repoClient, (d as any).id, d as any)
        );
      }
      this.details = details;
    }
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IExecutionResult>(`executionresult/${this.#id}`)
        .then((res) => res.data)
        .then((er) => {
          // convert executionresult details into instance of ExecutionResultDetail
          if (er.details.length > 0) {
            er.details = er.details.map(
              (d) =>
                new ExecutionResultDetail(
                  this.#repoClient,
                  (d as any).id,
                  d as any
                )
            );
          }

          return er;
        });
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`executionresult/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: { name: string }) {
    this.details.modifiedDate = modifiedDateTime();

    return await this.#repoClient
      .Put<IExecutionResult>(`executionresult/${this.#id}`, {
        ...this.details,
      })
      .then((res) => res.data);
  }
}
