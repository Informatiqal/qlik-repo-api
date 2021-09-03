import { QlikRepositoryClient } from "qlik-rest-api";
import { Tag, IClassTag } from "./Tag";

export interface IClassTaskTriggers {
  get(arg: { id: string }): Promise<IClassTag>;
}

export class TaskTriggers implements IClassTaskTriggers {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    const tag: Tag = new Tag(this.repoClient, arg.id);
    await tag.init();

    return tag;
  }
}
