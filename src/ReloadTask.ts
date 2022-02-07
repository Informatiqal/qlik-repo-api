import { QlikRepositoryClient } from "qlik-rest-api";
import { ITask } from "./Task.interface";
import { ReloadTaskBase } from "./ReloadTaskBase";

export class ReloadTask extends ReloadTaskBase {
  // #repoClient: QlikRepositoryClient;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: ITask) {
    super(repoClient, id, "reloadtask", details);
    // this.#repoClient = repoClient;
  }
}
