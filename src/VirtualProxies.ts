import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { IEntityRemove, ISelection } from "./types/interfaces";
import { IClassVirtualProxy, VirtualProxy } from "./VirtualProxy";
import {
  IVirtualProxyConfig,
  IVirtualProxyConfigJwtAttributeMapItem,
  IVirtualProxyConfigSamlAttributeMapItem,
  IVirtualProxyCreate,
} from "./Proxy.interface";
import {
  IServerNodeConfiguration,
  IServerNodeConfigurationCondensed,
} from "./Nodes";
import { IClassNode, Node } from "./Node";
import {
  parseAuthenticationMethod,
  parseJwtAttributeMap,
  parseOidcAttributeMap,
  parseSamlAttributeMap,
} from "./util/parseAttributeMap";

export interface IClassVirtualProxies {
  get(id: string): Promise<IClassVirtualProxy>;
  getAll(): Promise<IClassVirtualProxy[]>;
  getFilter(filter: string): Promise<IClassVirtualProxy[]>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
  create(arg: IVirtualProxyCreate): Promise<IClassVirtualProxy>;
}

export class VirtualProxies implements IClassVirtualProxies {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    const vp: VirtualProxy = new VirtualProxy(this.repoClient, id);
    await vp.init();

    return vp;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`virtualproxyconfig/full`)
      .then((res) => {
        return res.data as IVirtualProxyConfig[];
      })
      .then((data) => {
        return data.map((t) => new VirtualProxy(this.repoClient, t.id, t));
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(
        `virtualProxies.getFilter: "filter" parameter is required`
      );

    return await this.repoClient
      .Get(`virtualproxyconfig?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IVirtualProxyConfig[])
      .then((data) => {
        return data.map((t) => new VirtualProxy(this.repoClient, t.id, t));
      });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `virtualProxies.removeFilter: "filter" parameter is required`
      );

    const vps = await this.getFilter(filter);
    if (vps.length == 0)
      throw new Error(
        `virtualProxies.removeFilter: filter query return 0 items`
      );

    return await Promise.all<IEntityRemove>(
      vps.map((vp: IClassVirtualProxy) =>
        vp.remove().then((s) => ({ id: vp.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/virtualproxyconfig`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async create(arg: IVirtualProxyCreate) {
    if (!arg.sessionCookieHeaderName)
      throw new Error(
        `virtualProxy.create: "sessionCookieHeaderName" parameter is required`
      );

    if (!arg.prefix)
      throw new Error(`virtualProxy.prefix: "prefix" parameter is required`);

    let data = {
      sessionCookieHeaderName: arg.sessionCookieHeaderName,
      prefix: arg.prefix,
      description: arg.description || "",
    };

    if (arg.loadBalancingServerNodes) {
      data["loadBalancingServerNodes"] = await this.parseLoadBalancingNodes(
        arg.loadBalancingServerNodes
      );
    }

    if (arg.authenticationMethod)
      data["authenticationMethod"] = parseAuthenticationMethod(
        arg.authenticationMethod
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

    return await this.repoClient
      .Post(`virtualproxyconfig`, { ...data })
      .then((res) => res.data as IVirtualProxyConfig)
      .then((d) => new VirtualProxy(this.repoClient, d.id, d));
  }

  private async parseLoadBalancingNodes(
    nodes: string[]
  ): Promise<IServerNodeConfigurationCondensed[]> {
    let existingNodes = await this.repoClient
      .Get(`servernodeconfiguration/full`)
      .then((res) => res.data as IServerNodeConfiguration[])
      .then((data) => {
        return data.map((t) => {
          return new Node(this.repoClient, t.id, t);
        });
      });

    return nodes.map((n) => {
      let nodeCondensed = (existingNodes as IClassNode[]).filter(
        (n1) => n1.details.hostName == n
      );

      return nodeCondensed[0].details as IServerNodeConfigurationCondensed;
    });
  }
}
