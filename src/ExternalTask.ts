import { QlikRepositoryClient } from "qlik-rest-api";
import { ITask } from "./Task.interface";
import { ReloadTaskBase } from "./ReloadTaskBase";

export class ExternalTask extends ReloadTaskBase {
  constructor(repoClient: QlikRepositoryClient, id: string, details?: ITask) {
    super(repoClient, id, "externalprogramtask", details);
  }
}
