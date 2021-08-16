import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { ICustomPropertyCondensed } from "./CustomProperties";
import { ITagCondensed } from "./Tags";
import { IClassNode, Node } from "./Node";

export interface IServerNodeConfiguration {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  customProperties?: ICustomPropertyCondensed[];
  tags?: ITagCondensed[];
  name: string;
  hostName: string;
  isCentral?: boolean;
  nodePurpose?: number;
  engineEnabled?: boolean;
  proxyEnabled?: boolean;
  printingEnabled?: boolean;
  schedulerEnabled?: boolean;
  temporaryfilepath: string;
  failoverCandidate?: boolean;
  serviceCluster: {
    id: string;
    name: string;
    privileges: string[];
  };
  roles: {
    id: string;
    definition: number;
    privileges: string[];
  }[];
}

export interface IServerNodeConfigurationCondensed {
  id: string;
  name: string;
  hostName: string;
  temporaryfilepath: string;
  privileges: string[];
  serviceCluster: {
    id: string;
    name: string;
    privileges: string[];
  };
  roles: {
    id: string;
    definition: number;
    privileges: string[];
  }[];
}

export interface INodeUpdate {
  // id: string;
  name?: string;
  nodePurpose?:
    | "Production"
    | "Development"
    | "Both"
    | "ProductionAndDevelopment";
  engineEnabled?: boolean;
  proxyEnabled?: boolean;
  schedulerEnabled?: boolean;
  printingEnabled?: boolean;
  failoverCandidate?: boolean;
}

export interface INodeCreate {
  hostName: string;
  name?: string;
  nodePurpose?:
    | "Production"
    | "Development"
    | "Both"
    | "ProductionAndDevelopment";
  engineEnabled?: boolean;
  proxyEnabled?: boolean;
  schedulerEnabled?: boolean;
  printingEnabled?: boolean;
  failoverCandidate?: boolean;
  tags?: string[];
  customProperties?: string[];
}

export interface IClassNodes {
  count(): Promise<number>;
  get(id: string): Promise<IClassNode>;
  getAll(): Promise<IClassNode[]>;
  getFilter(filter: string, full?: boolean): Promise<IClassNode[]>;
  create(arg: INodeCreate): Promise<IClassNode>;
  register(id: string): Promise<boolean>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
}

export class Nodes implements IClassNodes {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async count(): Promise<number> {
    return await this.repoClient
      .Get(`servernodeconfiguration/count`)
      .then((res) => res.data as number);
  }

  public async create(arg: INodeCreate) {
    let nodeConfig = {
      hostName: arg.hostName,
      name: arg.name || arg.hostName,
      configuration: {
        engineEnabled: arg.engineEnabled || true,
        proxyEnabled: arg.proxyEnabled || true,
        schedulerEnabled: arg.schedulerEnabled || true,
        printingEnabled: arg.printingEnabled || true,
        nodePurpose: 2,
      },
    };

    if (arg.failoverCandidate) {
      nodeConfig.configuration.engineEnabled = true;
      nodeConfig.configuration.proxyEnabled = true;
      nodeConfig.configuration.schedulerEnabled = true;
      nodeConfig.configuration.printingEnabled = true;
    }

    if (arg.nodePurpose) {
      if (arg.nodePurpose == "Production")
        nodeConfig.configuration.nodePurpose = 0;
      if (arg.nodePurpose == "Development")
        nodeConfig.configuration.nodePurpose = 1;
      if (arg.nodePurpose == "ProductionAndDevelopment")
        nodeConfig.configuration.nodePurpose = 2;
      if (arg.nodePurpose == "Both") nodeConfig.configuration.nodePurpose = 2;
    }

    let container = await this.repoClient
      .Post(`servernodeconfiguration/container`, nodeConfig)
      .then((c) => c.data);

    return await this.repoClient
      .Get(`servernoderegistration/start/${container.configuration.id}`)
      .then((n) => n.data as IServerNodeConfiguration)
      .then((n) => new Node(this.repoClient, n.id, n));
  }

  public async get(id: string) {
    if (!id) throw new Error(`node.get: "id" parameter is required`);
    const node: Node = new Node(this.repoClient, id);
    await node.init();

    return node;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`servernodeconfiguration/full`)
      .then((res) => res.data as IServerNodeConfiguration[])
      .then((data) => {
        return data.map((t) => new Node(this.repoClient, t.id, t));
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`node.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(
        `servernodeconfiguration/full?filter=(${encodeURIComponent(filter)})`
      )
      .then((res) => res.data as IServerNodeConfiguration[])
      .then((data) => {
        return data.map((t) => new Node(this.repoClient, t.id, t));
      });
  }

  // TODO: implementation
  public async register(id?: string): Promise<true> {
    return true;
  }

  public async removeFilter(filter: string): Promise<IEntityRemove[]> {
    if (!filter)
      throw new Error(`node.removeFilter: "filter" parameter is required`);

    const nodes = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      nodes.map((node: IClassNode) =>
        node.remove().then((s) => ({ id: node.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/servernodeconfiguration`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
