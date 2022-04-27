import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import {
  ISelection,
  IEngineGetValid,
  IEngineGetValidResult,
  IEngine,
} from "./types/interfaces";

import { Engine, IClassEngine } from "./Engine";

export interface IClassEngines {
  get(arg: { id: string }): Promise<IClassEngine>;
  getAll(): Promise<IClassEngine[]>;
  getFilter(arg: { filter: string }): Promise<IClassEngine[]>;
  getValid(arg?: IEngineGetValid): Promise<IEngineGetValidResult[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class Engines implements IClassEngines {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`engines.get: "id" parameter is required`);
    const engine: Engine = new Engine(this.#repoClient, arg.id);
    await engine.init();

    return engine;
  }

  public async getAll() {
    return await this.#repoClient
      .Get(`engineservice/full`)
      .then((res) => res.data as IEngine[])
      .then((data) => {
        return data.map((t) => new Engine(this.#repoClient, t.id, t));
      });
  }

  public async getValid(arg?: IEngineGetValid) {
    let loadBalancingPurpose = 2;
    if (arg && arg.loadBalancingPurpose == "Production")
      loadBalancingPurpose = 0;
    if (arg && arg.loadBalancingPurpose == "Development")
      loadBalancingPurpose = 1;
    if (arg && arg.loadBalancingPurpose == "Any") loadBalancingPurpose = 2;

    const body = {
      proxyId: arg.proxyID || "",
      proxyPrefix: arg.proxyPrefix || "",
      appId: arg.appId || "",
      loadBalancingPurpose: loadBalancingPurpose,
    };

    return await this.#repoClient
      .Post(`loadbalancing/validengines"`, body)
      .then((res) => res.data as IEngineGetValidResult[]);
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter) throw new Error(`engine.getFilter: "filter" is required`);

    let baseUrl = `engineservice/full`;

    return await this.#repoClient
      .Get(`${baseUrl}?filter=(${encodeURIComponent(arg.filter)})`)
      .then((res) => res.data as IEngine[])
      .then((data) => {
        return data.map((t) => new Engine(this.#repoClient, t.id, t));
      });
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/engineservice`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
