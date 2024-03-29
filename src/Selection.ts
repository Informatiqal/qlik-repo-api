import { QlikRepositoryClient } from "qlik-rest-api";
import { ISelection } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { URLBuild } from "./util/generic";

export interface IClassSelection {
  remove(): Promise<IHttpStatus>;
  data(arg: { path: string }): Promise<any>;
}

export class Selection implements IClassSelection {
  #repoClient: QlikRepositoryClient;
  private area: string;
  details: ISelection;
  constructor(repoClient: QlikRepositoryClient, area: string) {
    this.area = area;
    this.#repoClient = repoClient;
    this.details = {};
  }

  async init(filter: string) {
    if (!this.details.id) {
      const urlBuild = new URLBuild(`selection/${this.area}`);
      urlBuild.addParam("filter", filter);

      this.details = await this.#repoClient
        .Post<ISelection>(`${urlBuild.getUrl()}`, {})
        .then((res) => res.data);
    }
  }

  async data(arg: { path: string }) {
    if (!arg.path)
      throw new Error(`selection.data: "path" parameter is required`);

    return await this.#repoClient
      .Get(`selection/${this.details.id}/${arg.path}`)
      .then((res) => res.data);
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`selection/${this.details.id}`)
      .then((res) => res.status);
  }
}
