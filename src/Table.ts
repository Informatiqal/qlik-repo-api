import { QlikRepoApi } from "./main";
import { URLBuild } from "./util/generic";

import { IHttpReturn } from "./interfaces";
import { ITableCreate } from "./interfaces/argument.interface";

export class Table {
  constructor() {}

  public async tableCreate(
    this: QlikRepoApi,
    arg: ITableCreate
  ): Promise<IHttpReturn> {
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
