import { QlikRepositoryClient } from "qlik-rest-api";
import { modifiedDateTime } from "./util/generic";
import { ExecutionResultDetail } from "./ExecutionResultDetail";
import { IExecutionResult, IExecutionResultCreate } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";

export interface IClassExecutionResult {
  remove(): Promise<IHttpStatus>;
  update(arg: IExecutionResultCreate): Promise<IExecutionResult>;
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

    this.details = {} as IExecutionResult;
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

  public async update(arg: IExecutionResultCreate) {
    this.details.modifiedDate = modifiedDateTime();

    // TODO: how to approach "details" property?
    // TODO: to be tested. its not tested at all atm!
    if (arg.appID) this.details.appID = arg.appID;
    if (arg.duration) this.details.duration = arg.duration;
    if (arg.executingNodeID) this.details.executingNodeID = arg.executingNodeID;
    if (arg.executingNodeName)
      this.details.executingNodeName = arg.executingNodeName;
    if (arg.scriptLogAvailable)
      this.details.scriptLogAvailable = arg.scriptLogAvailable;
    if (arg.scriptLogLocation)
      this.details.scriptLogLocation = arg.scriptLogLocation;
    if (arg.scriptLogSize) this.details.scriptLogSize = arg.scriptLogSize;
    if (arg.startTime) this.details.startTime = arg.startTime;
    if (arg.status) this.details.status = arg.status;
    if (arg.stopTime) this.details.stopTime = arg.stopTime;
    if (arg.taskID) this.details.taskID = arg.taskID;

    return await this.#repoClient
      .Put<IExecutionResult>(`executionresult/${this.#id}`, {
        ...this.details,
      })
      .then((res) => res.data);
  }
}
