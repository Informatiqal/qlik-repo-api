import { QlikRepositoryClient } from "qlik-rest-api";
import { IClassSelection, Selection } from "./Selection";
import { TSelectionAreas } from "./types/ranges";

export interface IClassSelections {
  create(arg: {
    area: TSelectionAreas;
    filter?: string;
  }): Promise<IClassSelection>;
}

export class Selections implements IClassSelections {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async create(arg: { area: TSelectionAreas; filter?: string }) {
    if (!arg.area)
      throw new Error(`select.create: "area" parameter is required`);

    const selection: Selection = new Selection(this.#repoClient, arg.area);
    await selection.init(arg.filter);

    return selection;
  }
}
