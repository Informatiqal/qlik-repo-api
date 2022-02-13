import { QlikRepositoryClient } from "qlik-rest-api";
import { IClassReloadTaskBase, ReloadTaskBase } from "./ReloadTaskBase";
import { ITask } from "./Task.interface";

export interface IClassReloadTask extends IClassReloadTaskBase {
  scriptLogGet(arg: { fileReferenceId: string }): Promise<string>;
  scriptLogFileGet(arg: { executionResultId: string }): Promise<string>;
}

export class ReloadTask extends ReloadTaskBase implements IClassReloadTask {
  #repoClient: QlikRepositoryClient;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: ITask) {
    super(repoClient, id, "reloadtask", details);
  }

  async scriptLogGet(arg: { fileReferenceId: string }) {
    if (!arg.fileReferenceId)
      throw new Error(
        `task.scriptLogGet: "fileReferenceId" parameter is required`
      );

    return await this.#repoClient
      .Get(
        `externalprogramtask/${
          this.details.id
        }/scriptlog?filereferenceid=${encodeURIComponent(arg.fileReferenceId)}
    `
      )
      .then((res) => res.data as string);
  }

  async scriptLogFileGet(arg: { executionResultId: string }) {
    if (!arg.executionResultId)
      throw new Error(
        `task.scriptLogFileGet: "executionResultId" parameter is required`
      );

    return await this.#repoClient
      .Get(
        `externalprogramtask/${
          this.details.id
        }/scriptlog?executionresultid =${encodeURIComponent(
          arg.executionResultId
        )}
  `
      )
      .then((res) => res.data as string);
  }
}
