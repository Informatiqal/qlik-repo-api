import { QlikRepositoryClient } from "qlik-rest-api";
import { IEntityRemove } from "./types/interfaces";
import { INodeUpdate, IServerNodeConfiguration } from "./Nodes";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassNode {
  remove(): Promise<IEntityRemove>;
  update(arg: INodeUpdate): Promise<IServerNodeConfiguration>;
  details: IServerNodeConfiguration;
}

export class Node implements IClassNode {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: IServerNodeConfiguration;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IServerNodeConfiguration
  ) {
    if (!id) throw new Error(`tags.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`servernodeconfiguration/${this.id}`)
        .then((res) => res.data as IServerNodeConfiguration);
    }
  }

  public async remove() {
    return await this.repoClient
      .Delete(`servernodeconfiguration/${this.id}`)
      .then((res) => {
        return { id: this.id, status: res.status } as IEntityRemove;
      });
  }

  public async update(arg: INodeUpdate) {
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
      this.repoClient,
      this.details,
      arg
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`servernodeconfiguration/${this.details.id}`, { ...this.details })
      .then((res) => res.data as IServerNodeConfiguration);
  }
}
