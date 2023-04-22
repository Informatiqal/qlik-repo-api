import { QlikRepositoryClient } from "qlik-rest-api";
import { modifiedDateTime } from "./util/generic";
import {
  IExecutionResultDetail,
  IExecutionResultDetailCreate,
} from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";

export interface IClassExecutionResultDetail {
  remove(): Promise<IHttpStatus>;
  update(arg: IExecutionResultDetailCreate): Promise<IExecutionResultDetail>;
  details: IExecutionResultDetail;
}

export class ExecutionResultDetail implements IClassExecutionResultDetail {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IExecutionResultDetail;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IExecutionResultDetail
  ) {
    if (!id) throw new Error(`executionResult.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IExecutionResultDetail>(`executionresult/detail/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`executionresult/detail/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: IExecutionResultDetailCreate) {
    this.details.modifiedDate = modifiedDateTime();

    this.details.message = arg.message;
    this.details.detailsType = arg.detailsType;

    return await this.#repoClient
      .Put<IExecutionResultDetail>(`executionresult/detail/${this.#id}`, {
        ...this.details,
      })
      .then((res) => res.data);
  }
}
