import { QlikRepositoryClient } from "qlik-rest-api";
import { modifiedDateTime } from "./util/generic";
import { ITag } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";

export interface IClassTag {
  remove(): Promise<IHttpStatus>;
  update(arg: { name: string }): Promise<ITag>;
  details: ITag;
}

export class Tag implements IClassTag {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: ITag;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: ITag) {
    if (!id) throw new Error(`tags.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<ITag>(`tag/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`tag/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: { name: string }) {
    if (!arg.name) throw new Error(`tag.update: "name" parameter is required`);

    this.details.name = arg.name;
    this.details.modifiedDate = modifiedDateTime();

    return await this.#repoClient
      .Put<ITag>(`tag/${this.#id}`, {
        ...this.details,
      })
      .then((res) => res.data);
  }
}
