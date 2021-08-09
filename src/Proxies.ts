import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { IClassNodes, IServerNodeConfigurationCondensed } from "./Nodes";
import { ISelection } from "./types/interfaces";

import {
  IProxyCreate,
  IProxyService,
  IVirtualProxyConfigSamlAttributeMapItem,
  IVirtualProxyConfigJwtAttributeMapItem,
  IVirtualProxyConfig,
} from "./Proxy.interface";
import { IClassNode } from "./Node";
import { IClassProxy, Proxy } from "./Proxy";
import { VirtualProxies } from "./VirtualProxies";

export interface IClassProxies {
  add(proxyId: string, virtualProxyId: string): Promise<IClassProxy>;
  addVirtualProxy(virtualProxyId: string): Promise<IVirtualProxyConfig>;
  get(id: string): Promise<IClassProxy>;
  getAll(): Promise<IClassProxy[]>;
  getFilter(filter: string): Promise<IClassProxy[]>;
  create(arg: IProxyCreate): Promise<IProxyService>;
  select(filter: string): Promise<ISelection>;
}

export class Proxies implements IClassProxies {
  private repoClient: QlikRepositoryClient;
  private node: IClassNodes;
  constructor(private mainRepoClient: QlikRepositoryClient, node: IClassNodes) {
    this.repoClient = mainRepoClient;
    this.node = node;
  }

  public async add(proxyId: string, virtualProxyId: string) {
    if (!proxyId) throw new Error(`proxy.add: "proxyId" is required`);
    if (!virtualProxyId)
      throw new Error(`proxy.add: "virtualProxyId" is required`);

    let proxy = await this.get(proxyId).then((p) => p[0] as IProxyService);
    const virtualProxyInstance = new VirtualProxies(this.repoClient);
    let virtualProxy = await virtualProxyInstance.get(virtualProxyId);

    proxy.settings.virtualProxies.push(virtualProxy.details);

    return await this.repoClient
      .Post(`proxyservice/${proxyId}`, proxy)
      .then((res) => res.data as IProxyService)
      .then((s) => new Proxy(this.repoClient, s.id, s));
  }

  public async get(id: string) {
    if (!id) throw new Error(`proxy.get: "id" parameter is required`);
    const proxy: Proxy = new Proxy(this.repoClient, id);
    await proxy.init();

    return proxy;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`proxyservice/full`)
      .then((res) => res.data as IProxyService[])
      .then((data) => {
        return data.map((t) => {
          return new Proxy(this.repoClient, t.id, t);
        });
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`proxy.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`proxyservice/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IProxyService[])
      .then((data) => {
        return data.map((t) => {
          return new Proxy(this.repoClient, t.id, t);
        });
      });
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/proxyservice`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  // TODO: handle oidc arguments
  public async create(arg: IProxyCreate) {
    if (!arg.description)
      throw new Error(`proxy.create: "description" parameter is required`);
    if (!arg.sessionCookieHeaderName)
      throw new Error(
        `proxy.create: "sessionCookieHeaderName" parameter is required`
      );

    let data = {
      description: arg.description,
      sessionCookieHeaderName: arg.sessionCookieHeaderName,
    };

    if (arg.loadBalancingServerNodes) {
      data["loadBalancingServerNodes"] = await this.parseLoadBalancingNodes(
        arg.loadBalancingServerNodes
      );
    }
    if (arg.authenticationMethod)
      data["authenticationMethod"] = this.parseAuthenticationMethod(
        arg.authenticationMethod
      );
    if (arg.prefix) data["prefix"] = arg.prefix;
    if (arg.description) data["description"] = arg.description;
    if (arg.authenticationModuleRedirectUri)
      data["authenticationModuleRedirectUri"] =
        arg.authenticationModuleRedirectUri;
    if (arg.websocketCrossOriginWhiteList)
      data["websocketCrossOriginWhiteList"] = arg.websocketCrossOriginWhiteList;
    if (arg.additionalResponseHeaders)
      data["additionalResponseHeaders"] = arg.additionalResponseHeaders;
    if (arg.sessionInactivityTimeout)
      data["sessionInactivityTimeout"] = arg.sessionInactivityTimeout;

    if (arg.samlMetadataIdP) data["samlMetadataIdP"] = arg.samlMetadataIdP;
    if (arg.samlHostUri) data["samlHostUri"] = arg.samlHostUri;
    if (arg.samlEntityId) data["samlEntityId"] = arg.samlEntityId;
    if (arg.samlAttributeUserId)
      data["samlAttributeUserId"] = arg.samlAttributeUserId;
    if (arg.samlAttributeUserDirectory)
      data["samlAttributeUserDirectory"] = arg.samlAttributeUserDirectory;
    if (arg.samlAttributeMap) {
      data["samlAttributeMap"] = this.parseSamlAttributeMap(
        arg.samlAttributeMap
      );
    }
    if (arg.samlSlo) data["samlSlo"] = arg.samlSlo;
    if (arg.jwtPublicKeyCertificate)
      data["jwtPublicKeyCertificate"] = arg.jwtPublicKeyCertificate;
    if (arg.jwtAttributeUserId)
      data["jwtAttributeUserId"] = arg.jwtAttributeUserId;
    if (arg.jwtAttributeUserDirectory)
      data["jwtAttributeUserDirectory"] = arg.jwtAttributeUserDirectory;
    if (arg.jwtAttributeMap) {
      data["jwtAttributeMap"] = this.parseJwtAttributeMap(arg.jwtAttributeMap);
    }

    return await this.repoClient
      .Post(`virtualproxyconfig`, { ...data })
      .then((res) => {
        return res.data as IProxyService;
      });
  }

  public async metadataExport(id: string, fileName?: string): Promise<Buffer> {
    if (!fileName) {
      const virtualProxyInstance = new VirtualProxies(this.repoClient);
      const virtualProxy = virtualProxyInstance.get(id);

      fileName = `${(await virtualProxy).details.prefix}_metadata_sp.xml`;
    }

    let exportMetaData: string = await this.repoClient
      .Get(`virtualproxyconfig/${id}/generate/samlmetadata`)
      .then((m) => m.data as string);

    return await this.repoClient
      .Get(`download/samlmetadata/${exportMetaData}/${fileName}`)
      .then((m) => m.data as Buffer);
  }

  // TODO: what is this method supposed to do?
  public async addVirtualProxy(
    virtualProxyId: string
    // loadBalancingServerNodes?: string[],
    // websocketCrossOriginWhiteList?: string[]
  ) {
    if (!virtualProxyId)
      throw new Error(`proxy.virtualProxyAdd: "virtualProxyId" is required`);

    const virtualProxyInstance = new VirtualProxies(this.repoClient);
    const virtualProxy = await virtualProxyInstance.get(virtualProxyId);

    return virtualProxy.details;
  }

  private parseSamlAttributeMap(
    mappings: string[]
  ): IVirtualProxyConfigSamlAttributeMapItem[] {
    return mappings.map((mapping) => {
      let [senseAttribute, samlAttribute] = mapping.split("=");
      return {
        senseAttribute: senseAttribute,
        samlAttribute: samlAttribute,
        isMandatory: true,
      } as IVirtualProxyConfigSamlAttributeMapItem;
    });
  }

  private parseJwtAttributeMap(
    mappings: string[]
  ): IVirtualProxyConfigJwtAttributeMapItem[] {
    return mappings.map((mapping) => {
      let [senseAttribute, jwtAttribute] = mapping.split("=");
      return {
        senseAttribute: senseAttribute,
        jwtAttribute: jwtAttribute,
        isMandatory: true,
      } as IVirtualProxyConfigJwtAttributeMapItem;
    });
  }

  private async parseLoadBalancingNodes(
    nodes: string[]
  ): Promise<IServerNodeConfigurationCondensed[]> {
    let existingNodes = await this.node.getAll();

    return nodes.map((n) => {
      let nodeCondensed = (existingNodes as IClassNode[]).filter(
        (n1) => n1.details.hostName == n
      );

      return nodeCondensed[0].details as IServerNodeConfigurationCondensed;
    });
  }

  private parseAuthenticationMethod(authenticationMethod: string): number {
    if (authenticationMethod == "Ticket") return 0;
    if (authenticationMethod == "static") return 1;
    if (authenticationMethod == "dynamic") return 2;
    if (authenticationMethod == "SAML") return 3;
    if (authenticationMethod == "JWT") return 4;

    return 0;
  }
}
