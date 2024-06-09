import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { parseFilter } from "./util/filter";

import { ITable, ITableCreate, ITableRaw } from "./types/interfaces";
import { IHttpReturn } from "qlik-rest-api/dist/interfaces/interfaces";

export class Table {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async create<T>(arg: ITableCreate) {
    if (!arg.columns)
      throw new Error(`table.create: "columns" parameter is required`);
    if (!arg.type)
      throw new Error(`table.create: "type" parameter is required`);

    const urlBuild = new URLBuild(`${arg.type}/table`);
    urlBuild.addParam("skip", arg.skip);
    urlBuild.addParam("take", arg.take);
    urlBuild.addParam("sortColumn", arg.sortColumn);
    urlBuild.addParam("orderAscending", arg.orderAscending);

    const tableResponse = await this.#repoClient.Post<ITableRaw>(
      `${urlBuild.getUrl()}`,
      {
        entity: arg.type,
        columns: arg.columns,
      }
    );

    const transformedData = tableResponse.data.rows.map((r) => {
      const r2 = {};
      r.map((r1, i) => {
        r2[tableResponse.data.columnNames[i]] = r1;
      });

      return r2;
    });

    if (arg.filter) {
      const anonFunction = Function(
        "entities",
        `return entities.filter(f => ${parseFilter(arg.filter, "f")})`
      );

      try {
        tableResponse.data.rows = anonFunction(transformedData);
      } catch (e) {
        throw new Error(
          `table.create: possible filter transform issue. String comparison values should be in single quotes? Or some of the filtered fields do not exists? Original error: ${e.message}`
        );
      }
    } else {
      //TODO: to fix the typing here at some point
      //@ts-ignore
      tableResponse.data.rows = transformedData;
    }

    return tableResponse as IHttpReturn<ITable<T>>;
  }
}
