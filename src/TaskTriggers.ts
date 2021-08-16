import { QlikRepositoryClient } from "qlik-rest-api";
import { Tag, IClassTag } from "./Tag";

export interface IClassTaskTriggers {
  get(id: string): Promise<IClassTag>;
}

export class TaskTriggers implements IClassTaskTriggers {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    const tag: Tag = new Tag(this.repoClient, id);
    await tag.init();

    return tag;
  }
}
