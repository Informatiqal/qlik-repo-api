import { QlikRepositoryClient } from "qlik-rest-api";
import { ODAGService } from "./ODAGService";
import { URLBuild } from "./util/generic";

import { IEntityRemove, ISelection, IODAGService } from "./types/interfaces";

export class ODAG {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }): Promise<ODAGService> {
    if (!arg.id) throw new Error(`odag.get: "id" parameter is required`);
    const odag: ODAGService = new ODAGService(this.#repoClient, arg.id);
    await odag.init();

    return odag;
  }

  public async getAll(): Promise<ODAGService[]> {
    return await this.#repoClient
      .Get<IODAGService[]>(`odagservice/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new ODAGService(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }): Promise<ODAGService[]> {
    if (!arg.filter)
      throw new Error(`odag.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get<IODAGService[]>(
        `odagservice/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new ODAGService(this.#repoClient, t.id, t));
      });
  }

  public async removeFilter(arg: {
    filter: string;
  }): Promise<{ id: string; status: number }[]> {
    if (!arg.filter)
      throw new Error(`odag.removeFilter: "filter" parameter is required`);

    const odag = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      odag.map((o) => o.remove().then((s) => ({ id: o.details.id, status: s })))
    );
  }

  public async select(arg?: { filter: string }): Promise<ISelection> {
    const urlBuild = new URLBuild(`selection/odagservice`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }
}
