import { QlikRepoApi } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import {
  IHttpStatus,
  IEntityRemove,
  IProxyService,
  IProxyServiceCondensed,
  IVirtualProxyConfig,
  IVirtualProxyConfigCondensed,
  IVirtualProxyConfigSamlAttributeMapItem,
  IVirtualProxyConfigJwtAttributeMapItem,
  IServerNodeConfigurationCondensed,
} from "./interfaces";

import {
  IVirtualProxyUpdate,
  IProxyCreate,
  IProxyUpdate,
} from "./interfaces/argument.interface";

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

  public async proxyGet(this: QlikRepoApi, id: string): Promise<IProxyService> {
    if (!id) throw new Error(`proxyGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`proxyservice/${id}`)
      .then((res) => res.data as IProxyService);
  }

  public async proxyGetAll(
    this: QlikRepoApi
  ): Promise<IProxyServiceCondensed[]> {
    return await this.repoClient
      .Get(`proxyservice`)
      .then((res) => res.data as IProxyServiceCondensed[]);
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

  // TODO: handle oidc arguments
  public async proxyCreate(
    this: QlikRepoApi,
    arg: IProxyCreate
  ): Promise<IProxyService> {
    if (!arg.description)
      throw new Error(`proxyCreate: "description" parameter is required`);
    if (!arg.sessionCookieHeaderName)
      throw new Error(
        `proxyCreate: "sessionCookieHeaderName" parameter is required`
      );

    let data = {
      description: arg.description,
      sessionCookieHeaderName: arg.sessionCookieHeaderName,
    };

    if (arg.loadBalancingServerNodes) {
      data["loadBalancingServerNodes"] = await parseLoadBalancingNodes(
        this,
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

    return await this.repoClient
      .Post(`virtualproxyconfig`, { ...data })
      .then((res) => {
        return res.data as IProxyService;
      });
  }

  public async proxyUpdate(
    this: QlikRepoApi,
    arg: IProxyUpdate
  ): Promise<IProxyService> {
    if (!arg.id) throw new Error(`proxyUpdate: "id" parameter is required`);

    validateRanges(arg);

    let proxy = await this.proxyGet(arg.id);

    if (arg.listenPort) proxy.settings.listenPort = arg.listenPort;
    if (arg.unencryptedListenPort)
      proxy.settings.unencryptedListenPort = arg.unencryptedListenPort;
    if (arg.authenticationListenPort)
      proxy.settings.authenticationListenPort = arg.authenticationListenPort;
    if (arg.unencryptedAuthenticationListenPort)
      proxy.settings.unencryptedAuthenticationListenPort =
        arg.unencryptedAuthenticationListenPort;
    if (arg.keepAliveTimeoutSeconds)
      proxy.settings.keepAliveTimeoutSeconds = arg.keepAliveTimeoutSeconds;
    if (arg.maxHeaderSizeBytes)
      proxy.settings.maxHeaderSizeBytes = arg.maxHeaderSizeBytes;
    if (arg.maxHeaderLines) proxy.settings.maxHeaderLines = arg.maxHeaderLines;
    if (arg.restListenPort) proxy.settings.restListenPort = arg.restListenPort;
    if (arg.allowHttp) proxy.settings.allowHttp = arg.allowHttp;
    if (arg.sslBrowserCertificateThumbprint)
      proxy.settings.sslBrowserCertificateThumbprint =
        arg.sslBrowserCertificateThumbprint;
    if (arg.kerberosAuthentication)
      proxy.settings.kerberosAuthentication = arg.kerberosAuthentication;
    if (!arg.virtualProxies) proxy.settings.virtualProxies = [];
    if (arg.virtualProxies)
      proxy.settings.virtualProxies = await parseVirtualProxies(
        this,
        arg.virtualProxies
      );

    let updateCommon = new UpdateCommonProperties(this, proxy, arg);
    proxy = await updateCommon.updateAll();

    return await this.repoClient
      .Post(`proxyservice/${arg.id}`, { ...proxy })
      .then((res) => res.data as IProxyService);
  }

  // TODO: what is this method supposed to do?
  public async virtualProxyAdd(
    this: QlikRepoApi,
    virtualProxyId: string
    // loadBalancingServerNodes?: string[],
    // websocketCrossOriginWhiteList?: string[]
  ): Promise<IVirtualProxyConfig> {
    if (!virtualProxyId)
      throw new Error(`virtualProxyAdd: "virtualProxyId" is required`);

    let virtualProxy = await this.virtualProxyGet(virtualProxyId).then(
      (vp) => vp[0] as IVirtualProxyConfig
    );

    return virtualProxy;
  }

  public async virtualProxyGet(
    this: QlikRepoApi,
    id: string
  ): Promise<IVirtualProxyConfig> {
    if (!id) throw new Error(`virtualProxyGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`virtualproxyconfig/${id}`)
      .then((res) => res.data as IVirtualProxyConfig);
  }

  public async virtualProxyGetAll(
    this: QlikRepoApi
  ): Promise<IVirtualProxyConfigCondensed[]> {
    return await this.repoClient
      .Get(`virtualproxyconfig`)
      .then((res) => res.data as IVirtualProxyConfigCondensed[]);
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
  ): Promise<IEntityRemove> {
    if (!id) throw new Error(`virtualProxyRemove: "id" parameter is required`);

    return await this.repoClient.Get(`virtualproxyconfig/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  // TODO: handle oidc arguments
  public async virtualProxyUpdate(
    this: QlikRepoApi,
    arg: IVirtualProxyUpdate
  ): Promise<IVirtualProxyConfig> {
    if (!arg.id)
      throw new Error(`virtualProxyUpdate: "id" parameter is required`);

    let virtualProxy = await this.virtualProxyGet(arg.id);

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
      virtualProxy.authenticationMethod = parseAuthenticationMethod(
        arg.authenticationMethod
      );
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
  let existingNodes = await repoApi.nodeGetAll();

  return nodes.map((n) => {
    let nodeCondensed = (
      existingNodes as IServerNodeConfigurationCondensed[]
    ).filter((n1) => n1.hostName == n);

    return nodeCondensed[0];
  });
}

function parseAuthenticationMethod(authenticationMethod: string): number {
  if (authenticationMethod == "Ticket") return 0;
  if (authenticationMethod == "static") return 1;
  if (authenticationMethod == "dynamic") return 2;
  if (authenticationMethod == "SAML") return 3;
  if (authenticationMethod == "JWT") return 4;

  return 0;
}

function validateRanges(arg: IProxyUpdate) {
  if (arg.listenPort < 1 && arg.listenPort > 65536)
    throw new Error(`proxyUpdate: "listerPort" must be between 1 and 655536`);
  if (arg.unencryptedListenPort < 1 && arg.unencryptedListenPort > 65536)
    throw new Error(
      `proxyUpdate: "unencryptedListenPort" must be between 1 and 655536`
    );
  if (arg.authenticationListenPort < 1 && arg.authenticationListenPort > 65536)
    throw new Error(
      `proxyUpdate: "authenticationListenPort" must be between 1 and 655536`
    );
  if (
    arg.unencryptedAuthenticationListenPort < 1 &&
    arg.unencryptedAuthenticationListenPort > 65536
  )
    throw new Error(
      `proxyUpdate: "unencryptedAuthenticationListenPort" must be between 1 and 655536`
    );
  if (arg.keepAliveTimeoutSeconds < 1 && arg.keepAliveTimeoutSeconds > 300)
    throw new Error(
      `proxyUpdate: "keepAliveTimeoutSeconds" must be between 1 and 300`
    );
  if (arg.maxHeaderSizeBytes < 512 && arg.maxHeaderSizeBytes > 131072)
    throw new Error(
      `proxyUpdate: "maxHeaderSizeBytes" must be between 512 and 131072`
    );
  if (arg.maxHeaderLines < 20 && arg.maxHeaderLines > 1000)
    throw new Error(
      `proxyUpdate: "maxHeaderLines" must be between 20 and 1000`
    );
  if (arg.restListenPort < 1 && arg.restListenPort > 65536)
    throw new Error(
      `proxyUpdate: "restListenPort" must be between 1 and 655536`
    );
}

async function parseVirtualProxies(
  repoApi: QlikRepoApi,
  vpArg: string[]
): Promise<IVirtualProxyConfigCondensed[]> {
  let allVP = await repoApi.virtualProxyGetAll();
  let vpToAdd = allVP.filter((v) => {
    return vpArg.includes(v.prefix);
  });
  return vpToAdd;
}
