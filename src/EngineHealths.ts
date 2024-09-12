import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import {
  IEntityRemove,
  ISelection,
  IEngineHealth,
  IEngineHealthCreate,
} from "./types/interfaces";
import { EngineHealth } from "./EngineHealth";

export class EngineHealths {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }): Promise<EngineHealth> {
    const engineHealth: EngineHealth = new EngineHealth(
      this.#repoClient,
      arg.id
    );
    await engineHealth.init();

    return engineHealth;
  }

  public async getAll(): Promise<EngineHealth[]> {
    return await this.#repoClient
      .Get<IEngineHealth[]>(`enginehealth/full`)
      .then((res) => {
        return res.data;
      })
      .then((data) => {
        return data.map((t) => new EngineHealth(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }): Promise<EngineHealth[]> {
    if (!arg.filter)
      throw new Error(`engineHealth.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get<IEngineHealth[]>(
        `enginehealth?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new EngineHealth(this.#repoClient, t.id, t));
      });
  }

  public async create(arg: IEngineHealthCreate): Promise<EngineHealth> {
    return await this.#repoClient
      .Post<IEngineHealth>(`enginehealth`, arg)
      .then((res) => res.data)
      .then((t) => new EngineHealth(this.#repoClient, t.id, t));
  }

  public async createMany(arg: IEngineHealthCreate[]): Promise<EngineHealth[]> {
    if (arg.length == 0)
      throw new Error(
        `enginehealth.createMany: provide data for at least one entry`
      );

    return await this.#repoClient
      .Post<IEngineHealth[]>(`enginehealth/many`, arg)
      .then((res) => res.data)
      .then((engineHealths) =>
        engineHealths.map((t) => new EngineHealth(this.#repoClient, t.id, t))
      );
  }

  public async removeFilter(arg: { filter: string }): Promise<IEntityRemove[]> {
    if (!arg.filter)
      throw new Error(
        `engineHealth.removeFilter: "filter" parameter is required`
      );

    const engineHealths = await this.getFilter({ filter: arg.filter });
    if (engineHealths.length == 0)
      throw new Error(`engineHealth.removeFilter: filter query return 0 items`);

    return await Promise.all<IEntityRemove>(
      engineHealths.map((health) =>
        health.remove().then((s) => ({ id: health.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }): Promise<ISelection> {
    const urlBuild = new URLBuild(`selection/enginehealth`);
    urlBuild.addParam("filter", arg?.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async count(arg?: { filter: string }): Promise<number> {
    const urlBuild = new URLBuild(`enginehealth/count`);
    urlBuild.addParam("filter", arg?.filter);

    return await this.#repoClient.Get<number>(urlBuild.getUrl()).then((res) => {
      return res.data;
    });
  }
}
