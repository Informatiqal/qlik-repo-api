import { QlikGenericRestClient, QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { IEntityRemove, IHttpStatus, ISelection } from "./types/interfaces";
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
  get(arg: { id: string }): Promise<IClassNode>;
  getAll(): Promise<IClassNode[]>;
  getFilter(arg: { filter: string; full?: boolean }): Promise<IClassNode[]>;
  create(arg: INodeCreate): Promise<IClassNode>;
  register(arg: INodeCreate): Promise<IHttpStatus>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
}

export class Nodes implements IClassNodes {
  private repoClient: QlikRepositoryClient;
  private genericClient: QlikGenericRestClient;
  constructor(
    private mainRepoClient: QlikRepositoryClient,
    private mainGenericClient: QlikGenericRestClient
  ) {
    this.repoClient = mainRepoClient;
    this.genericClient = mainGenericClient;
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

    const container = await this.createNewNode(nodeConfig);

    const node = new Node(this.repoClient, container.id);
    await node.init();
    return node;
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`node.get: "id" parameter is required`);
    const node: Node = new Node(this.repoClient, arg.id);
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

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`node.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(
        `servernodeconfiguration/full?filter=(${encodeURIComponent(
          arg.filter
        )})`
      )
      .then((res) => res.data as IServerNodeConfiguration[])
      .then((data) => {
        return data.map((t) => new Node(this.repoClient, t.id, t));
      });
  }

  public async register(arg: INodeCreate) {
    const node = await this.createNewNode(arg);

    const registration = await this.repoClient
      .Get(`servernoderegistration/start/${node.id}`)
      .then((n) => n.data as IServerNodeConfiguration);

    return await this.genericClient
      .Post(`http://localhost:4570/certificateSetup`, registration)
      .then((res) => res.status);
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`node.removeFilter: "filter" parameter is required`);

    const nodes = await this.getFilter({ filter: arg.filter });
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

  private async createNewNode(
    arg: INodeCreate
  ): Promise<IServerNodeConfigurationCondensed> {
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

    return await this.repoClient
      .Post(`servernodeconfiguration/container`, nodeConfig)
      .then((c) => c.data.configuration as IServerNodeConfigurationCondensed);
  }
}
