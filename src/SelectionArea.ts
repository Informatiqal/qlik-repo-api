import { QlikRepositoryClient } from "qlik-rest-api";
import { ISelection } from "./types/interfaces";
import { URLBuild } from "./util/generic";
import { SelectionEntityCondensed } from "./util/SelectionEntity";

export class SelectionArea {
  #repoClient: QlikRepositoryClient;
  details: ISelection;
  area: string;
  filter: string;
  constructor(repoClient: QlikRepositoryClient, area: string, filter: string) {
    this.#repoClient = repoClient;
    this.details = {};
    this.area = area;
    this.filter = filter;
  }

  async init() {
    const urlBuild = new URLBuild(`selection/${this.area}`);
    urlBuild.addParam("filter", this.filter);

    this.details = await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`selection/${this.details.id}`)
      .then((res) => res.status);
  }

  public async removeAllItems(arg?: { keepSelection: boolean }) {
    // default keepSelection to true (if not provided)
    arg = { keepSelection: true, ...arg };

    const removedEntities: SelectionEntityCondensed[] = this.details.items.map(
      (i) => ({
        id: i.id,
        objectId: i.objectID,
        type: i.type,
      })
    );

    const data = await this.#repoClient
      .Delete(`selection/${this.details.id}/${this.area}`)
      .then((res) => ({ status: res.status, entities: removedEntities }));

    if (!arg.keepSelection) {
      await this.remove();
      this.details = {};
    } else {
      this.details = await this.#repoClient
        .Get<ISelection>(`/selection/${this.details.id}`)
        .then((res) => res.data);
    }

    return data;
  }

  async refresh() {
    this.details = await this.#repoClient
      .Get<ISelection>(`/selection/${this.details.id}`)
      .then((res) => res.data)
      .catch((e) => {
        throw new Error(`selection.refresh: ${e.message}`);
      });
  }

  public async counts() {
    const counts = await this.#repoClient
      .Get<number>(`selection/${this.details.id}/${this.area}/count`)
      .then((res) => res.data)
      .catch((e) => {
        throw new Error(`selections.create: ${e.message}`);
      });

    return counts;
  }

  public async getDetails(arg: { type: "full" | "synthetic" }) {
    if (!arg) throw new Error(`selection.getDetails: Please provide argument`);

    if (arg.type != "full" && arg.type != "synthetic")
      throw new Error(
        `selection.getDetails: "type" argument should be "full" or "synthetic. "${arg.type}" was provided`
      );

    const data = await this.#repoClient
      .Get(`selection/${this.details.id}/${this.area}/${arg.type}`)
      .then((res) => res.data);

    return data;
  }
}
