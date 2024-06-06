import { QlikRepositoryClient } from "qlik-rest-api";
import { IClassReloadTaskBase, ReloadTaskBase } from "./ReloadTaskBase";
import {
  IUpdateObjectOptions,
  ITask,
  ITaskReloadUpdate,
} from "./types/interfaces";
import { getAppForReloadTask } from "./util/ReloadTaskUtil";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassReloadTask extends IClassReloadTaskBase {
  scriptLogGet(arg: { fileReferenceId: string }): Promise<string>;
  scriptLogFileGet(arg: { executionResultId: string }): Promise<string>;
}

export class ReloadTask extends ReloadTaskBase implements IClassReloadTask {
  #repoClient: QlikRepositoryClient;
  #baseUrl: string;
  details: ITask;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: ITask) {
    super(repoClient, id, "reloadtask", details);
    this.#baseUrl = "reloadtask";
    this.#repoClient = repoClient;
  }

  async scriptLogGet(arg: { fileReferenceId: string }) {
    if (!arg.fileReferenceId)
      throw new Error(
        `task.scriptLogGet: "fileReferenceId" parameter is required`
      );

    return await this.#repoClient
      .Get<string>(
        `externalprogramtask/${
          this.details.id
        }/scriptlog?filereferenceid=${encodeURIComponent(arg.fileReferenceId)}
    `
      )
      .then((res) => res.data);
  }

  async scriptLogFileGet(arg: { executionResultId: string }) {
    if (!arg.executionResultId)
      throw new Error(
        `task.scriptLogFileGet: "executionResultId" parameter is required`
      );

    return await this.#repoClient
      .Get<string>(
        `externalprogramtask/${
          this.details.id
        }/scriptlog?executionresultid =${encodeURIComponent(
          arg.executionResultId
        )}
  `
      )
      .then((res) => res.data);
  }

  async update(arg: ITaskReloadUpdate, options?: IUpdateObjectOptions) {
    if (arg.name) this.details.name = arg.name;
    if (arg.enabled) this.details.enabled = arg.enabled;
    if (arg.taskSessionTimeout)
      this.details.taskSessionTimeout = arg.taskSessionTimeout;
    if (arg.maxRetries) this.details.maxRetries = arg.maxRetries;

    if (arg.appId || arg.appFilter) {
      const app = await getAppForReloadTask(
        arg.appId,
        arg.appFilter,
        this.#repoClient
      );
      this.details.app = app.details;
    }

    const updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put(`${this.#baseUrl}/${this.details.id}`, { ...this.details })
      .then((res) => res.data);
  }
}
