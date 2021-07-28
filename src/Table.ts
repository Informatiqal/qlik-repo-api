import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { IHttpReturn } from "./types/interfaces";

interface ITableColumnBase {
  columnType: string;
  definition: string;
  name?: string;
}

export interface ITableColumn {
  columnType: string;
  definition: string;
  name?: string;
  list?: ITableColumnBase[];
}

export interface ITableCreate {
  type: string;
  columns: ITableColumn[];
  filter?: string;
  skip?: number;
  take?: number;
  sortColumn?: string;
  orderAscending?: boolean;
}

export interface IClassTable {
  create(arg: ITableCreate): Promise<IHttpReturn>;
}

export class Table {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async create(arg: ITableCreate) {
    if (!arg.columns)
      throw new Error(`tableCreate: "columns" parameter is required`);
    if (!arg.type) throw new Error(`tableCreate: "type" parameter is required`);

    const urlBuild = new URLBuild(`${arg.type}/table`);
    urlBuild.addParam("filter", arg.filter);
    urlBuild.addParam("skip", arg.skip);
    urlBuild.addParam("take", arg.take);
    urlBuild.addParam("sortColumn", arg.sortColumn);
    urlBuild.addParam("orderAscending", arg.orderAscending);

    return await this.repoClient.Post(`${urlBuild.getUrl()}`, {
      type: arg.type,
      columns: arg.columns,
    });
  }
}
