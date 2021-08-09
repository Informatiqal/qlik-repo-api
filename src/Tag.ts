import { QlikRepositoryClient } from "qlik-rest-api";
import { modifiedDateTime } from "./util/generic";
import { ITag } from "./Tags";
import { IEntityRemove } from "./types/interfaces";

export interface IClassTag {
  remove(): Promise<IEntityRemove>;
  update(name: string): Promise<ITag>;
  details: ITag;
}

export class Tag implements IClassTag {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: ITag;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: ITag) {
    if (!id) throw new Error(`tags.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`tag/${this.id}`)
        .then((res) => res.data as ITag);
    }
  }

  public async remove() {
    return await this.repoClient.Delete(`tag/${this.id}`).then((res) => {
      return { id: this.id, status: res.status } as IEntityRemove;
    });
  }

  public async update(name: string) {
    if (!name) throw new Error(`tag.update: "name" parameter is required`);

    this.details.name = name;
    this.details.modifiedDate = modifiedDateTime();

    this.details = await this.repoClient
      .Put(`tag/${this.id}`, {
        ...this.details,
      })
      .then((res) => res.data as ITag);

    return this.details;
  }
}
