import { QlikRepositoryClient } from "qlik-rest-api";
import { ODAGRequest } from "./ODAGRequest";
import { URLBuild } from "./util/generic";

import { IEntityRemove, ISelection, IOdagRequest } from "./types/interfaces";

export class ODAGRequests {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }): Promise<ODAGRequest> {
    if (!arg.id) throw new Error(`odagRequest.get: "id" parameter is required`);
    const odagRequest: ODAGRequest = new ODAGRequest(this.#repoClient, arg.id);
    await odagRequest.init();

    return odagRequest;
  }

  public async getAll(): Promise<ODAGRequest[]> {
    return await this.#repoClient
      .Get<IOdagRequest[]>(`odagrequest/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new ODAGRequest(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }): Promise<ODAGRequest[]> {
    if (!arg.filter)
      throw new Error(`odagRequest.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get<IOdagRequest[]>(
        `odagrequest/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new ODAGRequest(this.#repoClient, t.id, t));
      });
  }

  public async removeFilter(arg: {
    filter: string;
  }): Promise<{ id: string; status: number }[]> {
    if (!arg.filter)
      throw new Error(
        `odagRequest.removeFilter: "filter" parameter is required`
      );

    const odagRequest = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      odagRequest.map((o) =>
        o.remove().then((s) => ({ id: o.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }): Promise<ISelection> {
    const urlBuild = new URLBuild(`selection/odagrequest`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  // TODO: validate the input #270
  public async create(arg: Partial<IOdagRequest>) {
    return await this.#repoClient
      .Post<IOdagRequest>(`odagrequest`, arg)
      .then((res) => res.data)
      .then((s) => new ODAGRequest(this.#repoClient, s.id, s));
  }

  // TODO: validate the input #270
  public async createMany(arg: Partial<IOdagRequest[]>) {
    return await this.#repoClient
      .Post<IOdagRequest[]>(`odagrequest/many`, arg)
      .then((res) => res.data)
      .then((odagRequests) =>
        odagRequests.map((s) => new ODAGRequest(this.#repoClient, s.id, s))
      );
  }
}
