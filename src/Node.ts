import { QlikRepositoryClient } from "qlik-rest-api";
import { IUpdateObjectOptions } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { INodeUpdate, IServerNodeConfiguration } from "./types/interfaces";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassNode {
  remove(): Promise<IHttpStatus>;
  update(
    arg: INodeUpdate,
    options?: IUpdateObjectOptions
  ): Promise<IServerNodeConfiguration>;
  setCentral(): Promise<IHttpStatus>;
  details: IServerNodeConfiguration;
}

export class Node implements IClassNode {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IServerNodeConfiguration;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IServerNodeConfiguration
  ) {
    if (!id) throw new Error(`node.get: "id" parameter is required`);

    this.details = {} as IServerNodeConfiguration;
    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IServerNodeConfiguration>(`servernodeconfiguration/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`servernodeconfiguration/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: INodeUpdate, options?: IUpdateObjectOptions) {
    if (arg.name) this.details.name;
    if (arg.nodePurpose) {
      if (arg.nodePurpose == "Production") this.details.nodePurpose = 0;
      if (arg.nodePurpose == "Development") this.details.nodePurpose = 1;
      if (arg.nodePurpose == "ProductionAndDevelopment")
        this.details.nodePurpose = 2;
      if (arg.nodePurpose == "Both") this.details.nodePurpose = 2;
    }

    if (arg.engineEnabled) this.details.engineEnabled = arg.engineEnabled;
    if (arg.proxyEnabled) this.details.proxyEnabled = arg.proxyEnabled;
    if (arg.schedulerEnabled)
      this.details.schedulerEnabled = arg.schedulerEnabled;
    if (arg.printingEnabled) this.details.printingEnabled = arg.printingEnabled;

    if (arg.failoverCandidate) {
      this.details.failoverCandidate = this.details.failoverCandidate;
      if (this.details.failoverCandidate == true) {
        this.details.engineEnabled = true;
        this.details.proxyEnabled = true;
        this.details.schedulerEnabled = true;
        this.details.printingEnabled = true;
      }
    }

    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put<IServerNodeConfiguration>(
        `servernodeconfiguration/${this.details.id}`,
        { ...this.details }
      )
      .then((res) => res.data);
  }

  public async setCentral() {
    return await this.#repoClient
      .Get(`failover/tonode/${this.details.id}`)
      .then((res) => res.status);
  }
}
