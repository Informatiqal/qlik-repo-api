import { QlikGenericRestClient, QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import {
  IEntityRemove,
  ISelection,
  INodeCreate,
  IServerNodeConfiguration,
  IServerNodeConfigurationCondensed,
  IServerNodeResultContainer,
  INodeUpdate,
} from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { IClassNode, Node } from "./Node";

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
  #repoClient: QlikRepositoryClient;
  #genericClient: QlikGenericRestClient;
  constructor(
    private mainRepoClient: QlikRepositoryClient,
    private mainGenericClient: QlikGenericRestClient
  ) {
    this.#repoClient = mainRepoClient;
    this.#genericClient = mainGenericClient;
  }

  public async count(): Promise<number> {
    return await this.#repoClient
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

    const node = new Node(this.#repoClient, container.details.id);
    await node.init();
    return node;
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`node.get: "id" parameter is required`);
    const node: Node = new Node(this.#repoClient, arg.id);
    await node.init();

    return node;
  }

  public async getAll() {
    return await this.#repoClient
      .Get(`servernodeconfiguration/full`)
      .then((res) => res.data as IServerNodeConfiguration[])
      .then((data) => {
        return data.map((t) => new Node(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`node.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get(
        `servernodeconfiguration/full?filter=(${encodeURIComponent(
          arg.filter
        )})`
      )
      .then((res) => res.data as IServerNodeConfiguration[])
      .then((data) => {
        return data.map((t) => new Node(this.#repoClient, t.id, t));
      });
  }

  public async register(arg: INodeCreate) {
    const node = await this.createNewNode(arg);

    const registration = await this.#repoClient
      .Get(`servernoderegistration/start/${node.details.id}`)
      .then((n) => n.data as IServerNodeConfiguration);

    return await this.#genericClient
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

    return await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  private async createNewNode(arg: INodeCreate): Promise<IClassNode> {
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

    const node = await this.#repoClient
      .Post(`servernodeconfiguration/container`, nodeConfig)
      // .then((c) => c.data.configuration as IServerNodeConfigurationCondensed);
      .then(
        (res) =>
          new Node(
            this.#repoClient,
            (res.data as IServerNodeResultContainer).configuration.id,
            (res.data as IServerNodeResultContainer).configuration
          )
      );

    if (arg.customProperties || arg.tags) {
      const options: INodeUpdate = {};
      if (arg.customProperties) options.customProperties = arg.customProperties;
      if (arg.tags) options.tags = arg.tags;

      await node.update({ ...options });
    }

    return node;
  }
}
