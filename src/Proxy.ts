import { QlikRepoApi } from "./main";

import {
  IHttpStatus,
  IHttpReturnRemove,
  IProxyService,
  IProxyServiceCondensed,
  IVirtualProxyConfig,
  IVirtualProxyConfigCondensed,
  IVirtualProxyConfigSamlAttributeMapItem,
  IVirtualProxyConfigJwtAttributeMapItem,
  IServerNodeConfigurationCondensed,
} from "./interfaces";

import { IVirtualProxyUpdate } from "./interfaces/argument.interface";

export class Proxy {
  constructor() {}

  public async proxyAdd(
    this: QlikRepoApi,
    proxyId: string,
    virtualProxyId: string
  ): Promise<IProxyService> {
    if (!proxyId) throw new Error(`proxyAdd: "proxyId" is required`);
    if (!virtualProxyId)
      throw new Error(`proxyAdd: "virtualProxyId" is required`);

    let proxy = await this.proxyGet(proxyId).then((p) => p[0] as IProxyService);
    let virtualProxy = await this.virtualProxyGet(virtualProxyId).then(
      (vp) => vp[0] as IVirtualProxyConfig
    );

    proxy.settings.virtualProxies.push(virtualProxy);

    return await this.repoClient
      .Post(`proxyservice/${proxyId}`, proxy)
      .then((res) => res.data as IProxyService);
  }

  public async proxyGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IProxyService[] | IProxyServiceCondensed[]> {
    let url = "proxyservice";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res) => {
      if (!id) return res.data as IProxyServiceCondensed[];

      return [res.data] as IProxyService[];
    });
  }

  public async proxyGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IProxyServiceCondensed[]> {
    if (!filter)
      throw new Error(`proxyGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`proxyservice/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IProxyServiceCondensed[]);
  }

  public async proxyMetadataExport(
    this: QlikRepoApi,
    id: string,
    fileName?: string
  ): Promise<Buffer> {
    if (!fileName) {
      const virtualProxy = await this.virtualProxyGet(id).then(
        (v) => v[0] as IVirtualProxyConfig
      );
      fileName = `${virtualProxy.prefix}_metadata_sp.xml`;
    }

    let exportMetaData: string = await this.repoClient
      .Get(`virtualproxyconfig/${id}/generate/samlmetadata`)
      .then((m) => m.data as string);

    return await this.repoClient
      .Get(`download/samlmetadata/${exportMetaData}/${fileName}`)
      .then((m) => m.data as Buffer);
  }

  // TODO: complete implementation
  public async virtualProxyAdd(
    this: QlikRepoApi,
    virtualProxyId: string,
    loadBalancingServerNodes?: string[],
    websocketCrossOriginWhiteList?: string[]
  ): Promise<IVirtualProxyConfig> {
    if (!virtualProxyId)
      throw new Error(`virtualProxyAdd: "virtualProxyId" is required`);

    let virtualProxy = await this.virtualProxyGet(virtualProxyId).then(
      (vp) => vp[0] as IVirtualProxyConfig
    );

    // if (loadBalancingServerNodes)
    //   virtualProxy.loadBalancingServerNodes += loadBalancingServerNodes;

    // proxy.settings.virtualProxies.push(virtualProxy);

    // return await this.repoClient
    //   .Post(`proxyservice/${proxyId}`, proxy)
    //   .then((res) => res.data as IVirtualProxyConfig);
    return virtualProxy;
  }

  public async virtualProxyGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IVirtualProxyConfig[] | IVirtualProxyConfigCondensed[]> {
    let url = "virtualproxyconfig";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res) => {
      if (!id) return res.data as IVirtualProxyConfigCondensed[];

      return [res.data] as IVirtualProxyConfig[];
    });
  }

  public async virtualProxyGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IVirtualProxyConfigCondensed[]> {
    if (!filter)
      throw new Error(`virtualProxyGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`virtualproxyconfig/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IVirtualProxyConfigCondensed[]);
  }

  public async virtualProxyRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`virtualProxyRemove: "id" parameter is required`);

    return await this.repoClient.Get(`virtualproxyconfig/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  // TODO: handle oidc arguments
  public async virtualProxyUpdate(
    this: QlikRepoApi,
    arg: IVirtualProxyUpdate
  ): Promise<IVirtualProxyConfig> {
    if (!arg.id)
      throw new Error(`virtualProxyUpdate: "id" parameter is required`);

    let virtualProxy = await this.virtualProxyGet(arg.id).then(
      (v) => v[0] as IVirtualProxyConfig
    );

    if (arg.prefix) virtualProxy.prefix = arg.prefix;
    if (arg.description) virtualProxy.description = arg.description;
    if (arg.sessionCookieHeaderName)
      virtualProxy.sessionCookieHeaderName = arg.sessionCookieHeaderName;
    if (arg.authenticationModuleRedirectUri)
      virtualProxy.authenticationModuleRedirectUri =
        arg.authenticationModuleRedirectUri;
    if (arg.websocketCrossOriginWhiteList)
      virtualProxy.websocketCrossOriginWhiteList =
        arg.websocketCrossOriginWhiteList;
    if (arg.additionalResponseHeaders)
      virtualProxy.additionalResponseHeaders = arg.additionalResponseHeaders;
    if (arg.anonymousAccessMode)
      virtualProxy.anonymousAccessMode = arg.anonymousAccessMode;
    if (arg.windowsAuthenticationEnabledDevicePattern)
      virtualProxy.windowsAuthenticationEnabledDevicePattern =
        arg.windowsAuthenticationEnabledDevicePattern;
    if (arg.loadBalancingServerNodes) {
      virtualProxy.loadBalancingServerNodes = await parseLoadBalancingNodes(
        this,
        arg.loadBalancingServerNodes
      );
    }
    if (arg.magicLinkHostUri)
      virtualProxy.magicLinkHostUri = arg.magicLinkHostUri;
    if (arg.magicLinkFriendlyName)
      virtualProxy.magicLinkFriendlyName = arg.magicLinkFriendlyName;
    if (arg.authenticationMethod) {
      if (arg.authenticationMethod == "Ticket")
        virtualProxy.authenticationMethod = 0;
      if (arg.authenticationMethod == "static")
        virtualProxy.authenticationMethod = 1;
      if (arg.authenticationMethod == "dynamic")
        virtualProxy.authenticationMethod = 2;
      if (arg.authenticationMethod == "SAML")
        virtualProxy.authenticationMethod = 3;
      if (arg.authenticationMethod == "JWT")
        virtualProxy.authenticationMethod = 4;
    }
    if (arg.samlMetadataIdP) virtualProxy.samlMetadataIdP = arg.samlMetadataIdP;
    if (arg.samlHostUri) virtualProxy.samlHostUri = arg.samlHostUri;
    if (arg.samlEntityId) virtualProxy.samlEntityId = arg.samlEntityId;
    if (arg.samlAttributeUserId)
      virtualProxy.samlAttributeUserId = arg.samlAttributeUserId;
    if (arg.samlAttributeUserDirectory)
      virtualProxy.samlAttributeUserDirectory = arg.samlAttributeUserDirectory;
    if (arg.samlAttributeMap) {
      virtualProxy.samlAttributeMap = parseSamlAttributeMap(
        arg.samlAttributeMap
      );
    }
    if (arg.samlSlo) virtualProxy.samlSlo = arg.samlSlo;
    if (arg.jwtPublicKeyCertificate)
      virtualProxy.jwtPublicKeyCertificate = arg.jwtPublicKeyCertificate;
    if (arg.jwtAttributeUserId)
      virtualProxy.jwtAttributeUserId = arg.jwtAttributeUserId;
    if (arg.jwtAttributeUserDirectory)
      virtualProxy.jwtAttributeUserDirectory = arg.jwtAttributeUserDirectory;
    if (arg.jwtAttributeMap) {
      virtualProxy.jwtAttributeMap = parseJwtAttributeMap(arg.jwtAttributeMap);
    }

    return await this.repoClient
      .Put(`virtualproxyconfig/${arg.id}`, virtualProxy)
      .then((res) => {
        return res.data as IVirtualProxyConfig;
      });
  }
}

function parseSamlAttributeMap(
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

function parseJwtAttributeMap(
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

async function parseLoadBalancingNodes(
  repoApi: QlikRepoApi,
  nodes: string[]
): Promise<IServerNodeConfigurationCondensed[]> {
  let existingNodes = await repoApi.nodeGet();

  return nodes.map((n) => {
    let nodeCondensed = (
      existingNodes as IServerNodeConfigurationCondensed[]
    ).filter((n1) => n1.hostName == n);

    return nodeCondensed[0];
  });
}
