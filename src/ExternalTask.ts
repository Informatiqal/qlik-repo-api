import { QlikRepositoryClient } from "qlik-rest-api";
import { ReloadTaskBase } from "./ReloadTaskBase";
import {
  IUpdateObjectOptions,
  IExternalProgramTask,
  ITask,
  ITaskExternalUpdate,
} from "./types/interfaces";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export class ExternalTask extends ReloadTaskBase {
  #repoClient: QlikRepositoryClient;
  #baseUrl: string;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IExternalProgramTask
  ) {
    super(repoClient, id, "externalprogramtask", details);
  }

  async update(arg: ITaskExternalUpdate, options?: IUpdateObjectOptions) {
    if (arg.name) (this.details as IExternalProgramTask).name = arg.name;
    if (arg.enabled)
      (this.details as IExternalProgramTask).enabled = arg.enabled;
    if (arg.taskSessionTimeout)
      (this.details as IExternalProgramTask).taskSessionTimeout =
        arg.taskSessionTimeout;
    if (arg.maxRetries)
      (this.details as IExternalProgramTask).maxRetries = arg.maxRetries;
    if (arg.path) (this.details as IExternalProgramTask).path = arg.path;
    if (arg.path)
      (this.details as IExternalProgramTask).parameters = arg.parameters;

    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put(`${this.#baseUrl}/${this.details.id}`, { ...this.details })
      .then((res) => res.data as ITask);
  }
}
