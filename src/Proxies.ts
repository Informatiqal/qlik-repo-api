import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { IClassNodes } from "./Nodes";
import {
  ISelection,
  IServerNodeConfigurationCondensed,
  IProxyCreate,
  IProxyService,
  IProxyUpdate,
} from "./types/interfaces";

import { IClassNode } from "./Node";
import { Proxy } from "./Proxy";
import { VirtualProxies } from "./VirtualProxies";
import {
  parseAuthenticationMethod,
  parseJwtAttributeMap,
  parseOidcAttributeMap,
  parseSamlAttributeMap,
} from "./util/parseAttributeMap";

export interface IClassProxies {
  add(arg: { proxyId: string; virtualProxyId: string }): Promise<Proxy>;
  // addVirtualProxy(virtualProxyId: string): Promise<IVirtualProxyConfig>;
  get(arg: { id: string }): Promise<Proxy>;
  getAll(): Promise<Proxy[]>;
  getFilter(arg: { filter: string }): Promise<Proxy[]>;
  create(arg: IProxyCreate): Promise<Proxy>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class Proxies implements IClassProxies {
  #repoClient: QlikRepositoryClient;
  private node: IClassNodes;
  constructor(private mainRepoClient: QlikRepositoryClient, node: IClassNodes) {
    this.#repoClient = mainRepoClient;
    this.node = node;
  }

  public async add(arg: { proxyId: string; virtualProxyId: string }) {
    if (!arg.proxyId) throw new Error(`proxy.add: "proxyId" is required`);
    if (!arg.virtualProxyId)
      throw new Error(`proxy.add: "virtualProxyId" is required`);

    let proxy = await this.get({ id: arg.proxyId });
    const virtualProxyInstance = new VirtualProxies(this.#repoClient);
    let virtualProxy = await virtualProxyInstance.get({
      id: arg.virtualProxyId,
    });

    proxy.details.settings?.virtualProxies?.push(virtualProxy.details);

    return await this.#repoClient
      .Post<IProxyService>(`proxyservice/${arg.proxyId}`, proxy)
      .then((res) => res.data)
      .then((s) => new Proxy(this.#repoClient, s.id ?? "", s));
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`proxy.get: "id" parameter is required`);
    const proxy: Proxy = new Proxy(this.#repoClient, arg.id);
    await proxy.init();

    return proxy;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IProxyService[]>(`proxyservice/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new Proxy(this.#repoClient, t.id ?? "", t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`proxy.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get<IProxyService[]>(
        `proxyservice/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new Proxy(this.#repoClient, t.id ?? "", t));
      });
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/proxyservice`);
    urlBuild.addParam("filter", arg?.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async create(arg: IProxyCreate) {
    if (!arg.description)
      throw new Error(`proxy.create: "description" parameter is required`);
    if (!arg.sessionCookieHeaderName)
      throw new Error(
        `proxy.create: "sessionCookieHeaderName" parameter is required`
      );

    let data: { [k: string]: any } = {};

    data["description"] = arg.description;
    data["sessionCookieHeaderName"] = arg.sessionCookieHeaderName;

    if (arg.loadBalancingServerNodes) {
      data["loadBalancingServerNodes"] = await this.parseLoadBalancingNodes(
        arg.loadBalancingServerNodes
      );
    }
    if (arg.authenticationMethod)
      data["authenticationMethod"] = parseAuthenticationMethod(
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
    if (arg.samlAttributeMap)
      data["samlAttributeMap"] = parseSamlAttributeMap(arg.samlAttributeMap);

    if (arg.samlSlo) data["samlSlo"] = arg.samlSlo;
    if (arg.jwtPublicKeyCertificate)
      data["jwtPublicKeyCertificate"] = arg.jwtPublicKeyCertificate;
    if (arg.jwtAttributeUserId)
      data["jwtAttributeUserId"] = arg.jwtAttributeUserId;
    if (arg.jwtAttributeUserDirectory)
      data["jwtAttributeUserDirectory"] = arg.jwtAttributeUserDirectory;
    if (arg.jwtAttributeMap)
      data["jwtAttributeMap"] = parseJwtAttributeMap(arg.jwtAttributeMap);

    if (arg.oidcConfigurationEndpointUri)
      data["oidcConfigurationEndpointUri"] = arg.oidcConfigurationEndpointUri;
    if (arg.oidcClientId) data["oidcClientId"] = arg.oidcClientId;
    if (arg.oidcClientSecret) data["oidcClientSecret"] = arg.oidcClientSecret;
    if (arg.oidcRealm) data["oidcRealm"] = arg.oidcRealm;
    if (arg.oidcAttributeSub) data["oidcAttributeSub"] = arg.oidcAttributeSub;
    if (arg.oidcAttributeName)
      data["oidcAttributeName"] = arg.oidcAttributeName;
    if (arg.oidcAttributeGroups)
      data["oidcAttributeGroups"] = arg.oidcAttributeGroups;
    if (arg.oidcAttributeEmail)
      data["oidcAttributeEmail"] = arg.oidcAttributeEmail;
    if (arg.oidcAttributeClientId)
      data["oidcAttributeClientId"] = arg.oidcAttributeClientId;
    if (arg.oidcAttributePicture)
      data["oidcAttributePicture"] = arg.oidcAttributePicture;
    if (arg.oidcScope) data["oidcScope"] = arg.oidcScope;
    if (arg.oidcAttributeMap)
      data["oidcAttributeMap"] = parseOidcAttributeMap(arg.oidcAttributeMap);

    const proxy = await this.#repoClient
      .Post<IProxyService>(`virtualproxyconfig`, { ...data })
      .then((res) => new Proxy(this.#repoClient, res.data.id ?? "", res.data));

    if (arg.customProperties || arg.tags) {
      const options: IProxyUpdate = {};
      if (arg.customProperties) options.customProperties = arg.customProperties;
      if (arg.tags) options.tags = arg.tags;

      await proxy.update({ ...options });
    }

    return proxy;
  }

  // // TODO: this might not be needed. leaving here just in case
  // public async addVirtualProxy(
  //   virtualProxyId: string,
  //   loadBalancingServerNodes?: string[],
  //   websocketCrossOriginWhiteList?: string[]
  // ) {
  //   if (!virtualProxyId)
  //     throw new Error(`proxy.virtualProxyAdd: "virtualProxyId" is required`);

  //   const virtualProxyInstance = new VirtualProxies(this.#repoClient);
  //   const virtualProxy = await virtualProxyInstance.get(virtualProxyId);

  //   return virtualProxy.details;
  // }

  private async parseLoadBalancingNodes(
    nodes: string[]
  ): Promise<IServerNodeConfigurationCondensed[]> {
    let existingNodes = await this.node.getAll();

    return nodes.map((n) => {
      let nodeCondensed = existingNodes.filter(
        (n1) => n1.details.hostName == n
      );

      return nodeCondensed[0].details as IServerNodeConfigurationCondensed;
    });
  }
}
