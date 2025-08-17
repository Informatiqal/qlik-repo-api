import { QlikRepositoryClient } from "qlik-rest-api";
import { ISelection } from "../types/interfaces";
import { URLBuild } from "./generic";

export class SelectionEntity {
  #repoClient: QlikRepositoryClient;
  details: ISelection;
  area: string;
  constructor(repoClient: QlikRepositoryClient, area: string) {
    this.#repoClient = repoClient;
    this.details = {};
    this.area = area;
  }

  async init(
    arg: { filter: string; items?: never } | { filter?: never; items: string[] }
  ) {
    if (!arg.filter && !arg.items) {
      throw new Error(
        `selectEntity.init: at least one of "filter" OR "items" arguments is required`
      );
    }

    if (arg.filter && arg.items) {
      throw new Error(
        `selectEntity.init: please provide "filter" OR "items" arguments. Not both`
      );
    }

    if (arg.filter) {
      const urlBuild = new URLBuild(`selection/${this.area}`);
      urlBuild.addParam("filter", arg.filter);

      this.details = await this.#repoClient
        .Post<ISelection>(urlBuild.getUrl(), {})
        .then((res) => res.data);

      return;
    }

    if (arg.items) {
      const items = arg.items.map((i) => ({ objectID: i, type: this.area }));

      this.details = await this.#repoClient
        .Post<ISelection>(`selection`, { items })
        .then((res) => res.data);

      return;
    }
  }

  public async remove() {
    const removeStatus = await this.#repoClient
      .Delete(`selection/${this.details.id}`)
      .then((res) => res.status);

    // once the selection is removed then clear the local data
    this.details = {};

    return removeStatus;
  }

  public async removeAllItems(arg?: { keepSelection: boolean }) {
    const data = await this.#repoClient
      .Delete(`selection/${this.details.id}/${this.area}`)
      .then((res) => res.status);

    // if keepSelection is not explicitly set as "true"
    // then remove the selection
    // if keepSelection is explicitly set to "true"
    // then get the selection data again to reflect the actual data state
    if (arg && !arg.keepSelection) {
      await this.remove();
      this.details = {};
    } else {
      this.details = await this.#repoClient
        .Get<ISelection>(`/selection/${this.details.id}`)
        .then((res) => res.data);
    }

    return data;
  }

  public async counts() {
    return this.#repoClient
      .Get<number>(`selection/${this.details.id}/${this.area}/count`)
      .then((res) => res.data);
  }
}
