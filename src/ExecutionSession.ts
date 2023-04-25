import { QlikRepositoryClient } from "qlik-rest-api";
import { IExecutionSession } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";

export interface IClassExecutionSession {
  remove(): Promise<IHttpStatus>;
  details: IExecutionSession;
}

export class ExecutionSession implements IClassExecutionSession {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IExecutionSession;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IExecutionSession
  ) {
    if (!id)
      throw new Error(`executionsession.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IExecutionSession>(`executionsession/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`executionsession/${this.#id}`)
      .then((res) => res.status);
  }
}
