import { QlikRepositoryClient } from "qlik-rest-api";
import { ODAGRequest } from "./ODAGRequest";
import { URLBuild } from "./util/generic";

import { ISelection, IOdagRequest } from "./types/interfaces";
import { RemoveItemsResponse, SelectionEntity } from "./util/SelectionEntity";

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
  }): Promise<RemoveItemsResponse> {
    if (!arg.filter)
      throw new Error(
        `odagRequest.removeFilter: "filter" parameter is required`
      );

    const selection = new SelectionEntity(this.#repoClient, "odagrequest");
    await selection.init({ filter: arg.filter });
    const removeStatus = await selection.removeAllItems();

    return removeStatus;
  }

  public async removeList(arg: { items: string[] }) {
    if (!arg.items)
      throw new Error(`odagRequest.removeList: "items" parameter is required`);

    const selection = new SelectionEntity(this.#repoClient, "odagrequest");
    await selection.init({ items: arg.items });
    const removeStatus = await selection.removeAllItems();

    return removeStatus;
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
