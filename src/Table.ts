import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { IHttpReturn, ITableCreate } from "./types/interfaces";

export interface IClassTable {
  create(arg: ITableCreate): Promise<IHttpReturn>;
}

export class Table {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async create(arg: ITableCreate) {
    if (!arg.columns)
      throw new Error(`table.create: "columns" parameter is required`);
    if (!arg.type)
      throw new Error(`table.create: "type" parameter is required`);

    const urlBuild = new URLBuild(`${arg.type}/table`);
    urlBuild.addParam("filter", arg.filter);
    urlBuild.addParam("skip", arg.skip);
    urlBuild.addParam("take", arg.take);
    urlBuild.addParam("sortColumn", arg.sortColumn);
    urlBuild.addParam("orderAscending", arg.orderAscending);

    return await this.#repoClient.Post(`${urlBuild.getUrl()}`, {
      type: arg.type,
      columns: arg.columns,
    });
  }
}
