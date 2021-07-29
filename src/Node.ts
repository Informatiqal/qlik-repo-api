import { QlikRepositoryClient } from "./main";
import { URLBuild } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { ICustomPropertyCondensed } from "./CustomProperty";
import { ITagCondensed } from "./Tag";

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
  id: string;
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

export interface IClassNode {
  count(): Promise<number>;
  get(id: string): Promise<IServerNodeConfiguration>;
  getAll(): Promise<IServerNodeConfigurationCondensed[]>;
  getFilter(
    filter: string,
    full?: boolean
  ): Promise<IServerNodeConfiguration[]>;
  create(arg: INodeCreate): Promise<IServerNodeConfiguration>;
  register(id: string): Promise<boolean>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  update(arg: INodeUpdate): Promise<IServerNodeConfiguration>;
}

export class Node implements IClassNode {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async count(): Promise<number> {
    return await this.repoClient
      .Get(`servernodeconfiguration/count`)
      .then((res) => {
        return res.data as number;
      });
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
      .then((n) => n.data as IServerNodeConfiguration);
  }

  public async get(id: string) {
    if (!id) throw new Error(`node.get: "id" parameter is required`);
    return await this.repoClient
      .Get(`servernodeconfiguration/${id}`)
      .then((res) => res.data as IServerNodeConfiguration);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`servernodeconfiguration`)
      .then((res) => res.data as IServerNodeConfigurationCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`node.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(
        `servernodeconfiguration/full?filter=(${encodeURIComponent(filter)})`
      )
      .then((res) => res.data as IServerNodeConfiguration[]);
  }

  // TODO: implementation
  public async register(id?: string): Promise<true> {
    return true;
  }

  public async remove(id: string): Promise<IEntityRemove> {
    if (!id) throw new Error(`node.remove: "id" parameter is required`);

    return await this.repoClient
      .Delete(`servernodeconfiguration/${id}`)
      .then((res) => {
        return { id, status: res.status } as IEntityRemove;
      });
  }

  public async removeFilter(filter: string): Promise<IEntityRemove[]> {
    if (!filter)
      throw new Error(`node.removeFilter: "filter" parameter is required`);

    const nodes = await this.getAll().then((n: IServerNodeConfiguration[]) => {
      if (n.length == 0)
        throw new Error(`node.removeFilter: filter query return 0 items`);

      return n;
    });
    return await Promise.all<IEntityRemove>(
      nodes.map((ud) => {
        return this.remove(ud.id);
      })
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/servernodeconfiguration`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async update(arg: INodeUpdate) {
    if (!arg.id) throw new Error(`node.update: "id" parameter is required`);

    let node = await this.get(arg.id);
    if (arg.name) node.name;
    if (arg.nodePurpose) {
      if (arg.nodePurpose == "Production") node.nodePurpose = 0;
      if (arg.nodePurpose == "Development") node.nodePurpose = 1;
      if (arg.nodePurpose == "ProductionAndDevelopment") node.nodePurpose = 2;
      if (arg.nodePurpose == "Both") node.nodePurpose = 2;
    }

    if (arg.engineEnabled) node.engineEnabled = arg.engineEnabled;
    if (arg.proxyEnabled) node.proxyEnabled = arg.proxyEnabled;
    if (arg.schedulerEnabled) node.schedulerEnabled = arg.schedulerEnabled;
    if (arg.printingEnabled) node.printingEnabled = arg.printingEnabled;

    if (arg.failoverCandidate) {
      node.failoverCandidate = node.failoverCandidate;
      if (node.failoverCandidate == true) {
        node.engineEnabled = true;
        node.proxyEnabled = true;
        node.schedulerEnabled = true;
        node.printingEnabled = true;
      }
    }

    let updateCommon = new UpdateCommonProperties(this.repoClient, node, arg);
    node = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`servernodeconfiguration/${arg.id}`, { ...node })
      .then((res) => res.data as IServerNodeConfiguration);
  }
}
