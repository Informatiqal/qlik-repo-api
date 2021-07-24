import { QlikRepoApi } from "./main";

import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import {
  IRemoveFilter,
  IHttpReturnRemove,
  IHttpStatus,
  IServerNodeConfiguration,
  IServerNodeConfigurationCondensed,
  IEngine,
} from "./interfaces";

import { INodeUpdate, INodeCreate } from "./interfaces/argument.interface";

export class Node {
  constructor() {}

  public async nodeCount(this: QlikRepoApi, id?: string): Promise<number> {
    return await this.repoClient
      .Get(`servernodeconfiguration/count`)
      .then((res) => {
        return res.data as number;
      });
  }

  public async nodeCreate(
    this: QlikRepoApi,
    arg: INodeCreate
  ): Promise<IServerNodeConfiguration> {
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

  public async nodeGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IServerNodeConfiguration[] | IServerNodeConfigurationCondensed[]> {
    let url = "servernodeconfiguration";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res) => {
      if (!id) return res.data as IServerNodeConfigurationCondensed[];
      return [res.data] as IServerNodeConfiguration[];
    });
  }

  public async nodeGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IServerNodeConfiguration[]> {
    if (!filter)
      throw new Error(`nodeGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(
        `servernodeconfiguration/full?filter=(${encodeURIComponent(filter)})`
      )
      .then((res) => res.data as IServerNodeConfiguration[]);
  }

  // TODO: implementation
  public async nodeRegister(this: QlikRepoApi, id?: string): Promise<true> {
    return true;
  }

  public async nodeRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`nodeRemove: "id" parameter is required`);

    return await this.repoClient
      .Delete(`servernodeconfiguration/${id}`)
      .then((res) => {
        return { id, status: res.status as IHttpStatus };
      });
  }

  public async nodeRemoveFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IRemoveFilter[]> {
    if (!filter)
      throw new Error(`nodeRemoveFilter: "filter" parameter is required`);

    const nodes = await this.nodeGet(filter).then(
      (n: IServerNodeConfiguration[]) => {
        if (n.length == 0)
          throw new Error(`nodeRemoveFilter: filter query return 0 items`);

        return n;
      }
    );
    return await Promise.all<IRemoveFilter>(
      nodes.map((ud) => {
        return this.nodeRemove(ud.id);
      })
    );
  }

  public async nodeUpdate(
    this: QlikRepoApi,
    arg: INodeUpdate
  ): Promise<IServerNodeConfiguration> {
    if (!arg.id) throw new Error(`nodeUpdate: "id" parameter is required`);

    let node = await this.nodeGet(arg.id).then(
      (n) => n[0] as IServerNodeConfiguration
    );
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

    let updateCommon = new UpdateCommonProperties(this, node, arg);
    node = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`servernodeconfiguration/${arg.id}`, { ...node })
      .then((res) => res.data as IServerNodeConfiguration);
  }
}
