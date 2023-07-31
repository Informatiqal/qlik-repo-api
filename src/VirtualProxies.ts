import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import {
  IEntityRemove,
  ISelection,
  IVirtualProxyUpdate,
} from "./types/interfaces";
import { VirtualProxy } from "./VirtualProxy";
import { IVirtualProxyConfig, IVirtualProxyCreate } from "./types/interfaces";
import {
  IServerNodeConfiguration,
  IServerNodeConfigurationCondensed,
} from "./types/interfaces";
import { IClassNode, Node } from "./Node";
import {
  parseAnonymousAccessMode,
  parseAuthenticationMethod,
  parseJwtAttributeMap,
  parseOidcAttributeMap,
  parseSameSiteAttribute,
  parseSamlAttributeMap,
} from "./util/parseAttributeMap";

export interface IClassVirtualProxies {
  get(arg: { id: string }): Promise<VirtualProxy>;
  getAll(): Promise<VirtualProxy[]>;
  getFilter(arg: { filter: string }): Promise<VirtualProxy[]>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
  create(arg: IVirtualProxyCreate): Promise<VirtualProxy>;
}

export class VirtualProxies implements IClassVirtualProxies {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    const vp: VirtualProxy = new VirtualProxy(this.#repoClient, arg.id);
    await vp.init();

    return vp;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IVirtualProxyConfig[]>(`virtualproxyconfig/full`)
      .then((res) => {
        return res.data;
      })
      .then((data) => {
        return data.map(
          (t) => new VirtualProxy(this.#repoClient, t.id ?? "", t)
        );
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `virtualProxies.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get<IVirtualProxyConfig[]>(
        `virtualproxyconfig?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map(
          (t) => new VirtualProxy(this.#repoClient, t.id ?? "", t)
        );
      });
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `virtualProxies.removeFilter: "filter" parameter is required`
      );

    const vps = await this.getFilter({ filter: arg.filter });
    if (vps.length == 0)
      throw new Error(
        `virtualProxies.removeFilter: filter query return 0 items`
      );

    return await Promise.all<IEntityRemove>(
      vps.map((vp) =>
        vp.remove().then((s) => ({ id: vp.details.id ?? "", status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/virtualproxyconfig`);
    urlBuild.addParam("filter", arg?.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async create(arg: IVirtualProxyCreate) {
    if (!arg.sessionCookieHeaderName)
      throw new Error(
        `virtualProxy.create: "sessionCookieHeaderName" parameter is required`
      );

    if (!arg.prefix)
      throw new Error(`virtualProxy.prefix: "prefix" parameter is required`);

    if (!arg.description)
      throw new Error(
        `virtualProxy.prefix: "description" parameter is required`
      );

    let data: { [k: string]: any } = {};

    data["sessionCookieHeaderName"] = arg.sessionCookieHeaderName;
    data["prefix"] = arg.prefix;
    data["description"] = arg.description || "";

    if (arg.loadBalancingServerNodes)
      data["loadBalancingServerNodes"] = await this.parseLoadBalancingNodes(
        arg.loadBalancingServerNodes
      );

    if (arg.headerAuthenticationHeaderName)
      data["headerAuthenticationHeaderName"] =
        arg.headerAuthenticationHeaderName;

    if (arg.extendedSecurityEnvironment)
      data["extendedSecurityEnvironment"] = arg.extendedSecurityEnvironment;

    if (arg.headerAuthenticationStaticUserDirectory)
      data["headerAuthenticationStaticUserDirectory"] =
        arg.headerAuthenticationStaticUserDirectory;

    if (arg.headerAuthenticationDynamicUserDirectory)
      data["headerAuthenticationDynamicUserDirectory"] =
        arg.headerAuthenticationDynamicUserDirectory;

    if (arg.windowsAuthenticationEnabledDevicePattern)
      data["windowsAuthenticationEnabledDevicePattern"] =
        arg.windowsAuthenticationEnabledDevicePattern;

    if (arg.hasSecureAttributeHttp)
      data["hasSecureAttributeHttp"] = arg.hasSecureAttributeHttp;
    if (arg.hasSecureAttributeHttps)
      data["hasSecureAttributeHttps"] = arg.hasSecureAttributeHttps;

    if (arg.authenticationMethod)
      data["authenticationMethod"] = parseAuthenticationMethod(
        arg.authenticationMethod
      );

    if (arg.sameSiteAttributeHttp)
      data["sameSiteAttributeHttp"] = parseSameSiteAttribute(
        arg.sameSiteAttributeHttp
      );

    if (arg.sameSiteAttributeHttps)
      data["sameSiteAttributeHttps"] = parseSameSiteAttribute(
        arg.sameSiteAttributeHttps
      );

    if (arg.authenticationModuleRedirectUri)
      data["authenticationModuleRedirectUri"] =
        arg.authenticationModuleRedirectUri;

    if (arg.websocketCrossOriginWhiteList)
      data["websocketCrossOriginWhiteList"] = arg.websocketCrossOriginWhiteList;
    if (arg.additionalResponseHeaders)
      data["additionalResponseHeaders"] = arg.additionalResponseHeaders;
    if (arg.sessionInactivityTimeout)
      data["sessionInactivityTimeout"] = arg.sessionInactivityTimeout;
    if (arg.anonymousAccessMode)
      data["anonymousAccessMode"] = parseAnonymousAccessMode(
        arg.anonymousAccessMode
      );

    if (arg.samlMetadataIdP) data["samlMetadataIdP"] = arg.samlMetadataIdP;
    if (arg.samlHostUri) data["samlHostUri"] = arg.samlHostUri;
    if (arg.samlEntityId) data["samlEntityId"] = arg.samlEntityId;
    if (arg.samlAttributeUserId)
      data["samlAttributeUserId"] = arg.samlAttributeUserId;
    if (arg.samlAttributeUserDirectory)
      data["samlAttributeUserDirectory"] = arg.samlAttributeUserDirectory;
    if (arg.samlAttributeMap) {
      data["samlAttributeMap"] = parseSamlAttributeMap(arg.samlAttributeMap);
    }

    if (arg.samlSlo) data["samlSlo"] = arg.samlSlo;
    if (arg.jwtPublicKeyCertificate)
      data["jwtPublicKeyCertificate"] = arg.jwtPublicKeyCertificate;
    if (arg.jwtAttributeUserId)
      data["jwtAttributeUserId"] = arg.jwtAttributeUserId;
    if (arg.jwtAttributeUserDirectory)
      data["jwtAttributeUserDirectory"] = arg.jwtAttributeUserDirectory;
    if (arg.jwtAttributeMap) {
      data["jwtAttributeMap"] = parseJwtAttributeMap(arg.jwtAttributeMap);
    }

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

    const vp = await this.#repoClient
      .Post<IVirtualProxyConfig>(`virtualproxyconfig`, { ...data })
      .then((res) => res.data)
      .then((d) => new VirtualProxy(this.#repoClient, d.id ?? "", d));

    if (arg.customProperties || arg.tags) {
      const options: IVirtualProxyUpdate = {};
      if (arg.customProperties) options.customProperties = arg.customProperties;
      if (arg.tags) options.tags = arg.tags;

      await vp.update({ ...options });
    }

    return vp;
  }

  private async parseLoadBalancingNodes(
    nodes: string[]
  ): Promise<IServerNodeConfigurationCondensed[]> {
    let existingNodes = await this.#repoClient
      .Get<IServerNodeConfiguration[]>(`servernodeconfiguration/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => {
          return new Node(this.#repoClient, t.id ?? "", t);
        });
      });

    return nodes.map((n) => {
      const nodeCondensed = existingNodes.filter(
        (n1) => n1.details.hostName == n
      );

      if (nodeCondensed.length == 0)
        throw new Error(`virtualProxies: node not found! "${n}"`);

      return nodeCondensed[0].details as IServerNodeConfigurationCondensed;
    });
  }
}
