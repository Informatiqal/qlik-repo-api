import { QlikRepositoryClient } from "qlik-rest-api";
import { ISelection, SelectionItem1 } from "./types/interfaces";

export class SelectionItems {
  #repoClient: QlikRepositoryClient;
  details: ISelection;
  #items: SelectionItem1[];
  #areas: string[];
  constructor(repoClient: QlikRepositoryClient, items: SelectionItem1[]) {
    this.#repoClient = repoClient;
    this.details = {};
    this.#items = items;
    this.#areas = [...new Set(items.map((i) => i.type))];
  }

  async init() {
    this.details = await this.#repoClient
      .Post<ISelection>(`selection`, { items: this.#items })
      .then((res) => res.data)
      .catch((e) => {
        throw new Error(`selections.create: ${e.message}`);
      });
  }

  async remove() {
    return await this.#repoClient
      .Delete(`selection/${this.details.id}`)
      .then((res) => res.status);
  }

  async removeAllItems(arg?: { keepSelection: boolean }): Promise<{
    [k: string]: {
      status: number;
      entities: number;
    };
  }> {
    // default keepSelection to true (if not provided)
    arg = { keepSelection: true, ...arg };

    await this.refresh();

    const data = await Promise.all(
      this.#areas.map((a) => this.removeForArea(a))
    );

    await this.removeSelectionInternal(arg.keepSelection);

    const data1 = {};
    data.map((d) => {
      data1[d.area] = { status: d.status, entities: d.entities };
    });

    return data1;
  }

  async removeAllItemsForAreas(arg: {
    areas: string[];
    keepSelection?: boolean;
  }): Promise<{
    [k: string]: {
      status: number;
      entities: number;
    };
  }> {
    if (arg && !arg.areas)
      throw new Error(
        `selection.removeAllItemsForAreas: "areas" parameter is required`
      );

    arg = { keepSelection: true, ...arg };

    await this.refresh();

    const data = await Promise.all(arg.areas.map((a) => this.removeForArea(a)));

    await this.removeSelectionInternal(arg.keepSelection);

    const data1 = {};
    data.map((d) => {
      data1[d.area] = { status: d.status, entities: d.entities };
    });

    return data1;
  }

  async counts() {
    const counts = {};

    const res = await Promise.all(
      this.#areas.map((a) => {
        return this.#repoClient
          .Get<number>(`selection/${this.details.id}/${a}/count`)
          .then((res) => res.data);
      })
    );

    this.#areas.map((a, i) => {
      counts[a] = res[i].value;
    });

    return counts;
  }

  async refresh() {
    this.details = await this.#repoClient
      .Get<ISelection>(`/selection/${this.details.id}`)
      .then((res) => res.data)
      .catch((e) => {
        throw new Error(`selection.refresh: ${e.message}`);
      });
  }

  public async getDetails(arg: { type: "full" | "synthetic" }) {
    if (!arg) throw new Error(`selection.getDetails: Please provide argument`);

    if (arg.type != "full" && arg.type != "synthetic")
      throw new Error(
        `selection.getDetails: "type" argument should be "full" or "synthetic. "${arg.type}" was provided`
      );

    const data = await Promise.all(
      this.#areas.map((a) =>
        this.#repoClient
          .Get(`selection/${this.details.id}/${a}/${arg.type}`)
          .then((res) => {
            if (res && res.data) return res.data;
            return {};
          })
          .catch((e) => {
            return {};
          })
      )
    );

    return data.filter((d) => Object.keys(d).length > 0);
  }

  private async removeForArea(area: string) {
    const removedEntities: string[] = this.details.items
      .filter((i) => i.type == area)
      .map((i) => i.objectID);

    return this.#repoClient
      .Delete(`selection/${this.details.id}/${area}`)
      .then((res) => ({
        status: res.status,
        entities: removedEntities,
        area: area,
      }))
      .catch((e) => {
        throw new Error(`selection.removeForArea: ${e.message}`);
      });
  }

  private async removeSelectionInternal(keepSelection: boolean) {
    if (!keepSelection) {
      await this.remove();
      this.details = {};
    } else {
      this.details = await this.#repoClient
        .Get<ISelection>(`/selection/${this.details.id}`)
        .then((res) => res.data);
    }
  }
}
