import { QlikRepositoryClient } from "qlik-rest-api";
import { SelectionArea } from "./SelectionArea";
import { TSelectionAreas } from "./types/ranges";
import { SelectionItem1 } from "./index.doc";
import { SelectionItems } from "./SelectionItems";

export interface Selection {
  id: string;
  createdDate: string;
  modifiedDate: string;
  modifiedByUserName: string;
  items: {
    id: string;
    createdDate: string;
    modifiedDate: string;
    modifiedByUserName: string;
    type: string;
    objectId: string;
    objectName: string;
    schemaPath: string;
  }[];
}

export class Selections {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async create(
    arg:
      | {
          type: TSelectionAreas;
          filter?: string;
          items?: never;
        }
      | {
          items: SelectionItem1[];
          type?: never;
          filter?: never;
        }
  ) {
    if (!arg.type && !arg.items)
      throw new Error(
        `selections.create: At least one of "area" OR "items" parameter is required`
      );

    if (arg.type && arg.items)
      throw new Error(
        `selections.create: Only one of "area" OR "items" parameter is required`
      );

    let selection: SelectionArea | SelectionItems;

    if (arg.type) {
      selection = new SelectionArea(this.#repoClient, arg.type, arg.filter);
      await selection.init();
    }

    if (arg.items) {
      selection = new SelectionItems(this.#repoClient, arg.items);
      await selection.init();
    }

    return selection;
  }
}
