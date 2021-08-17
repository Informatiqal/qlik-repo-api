import { QlikRepositoryClient } from "qlik-rest-api";
import { IEntityRemove, IHttpStatus } from "./types/interfaces";
import {
  IVirtualProxyConfig,
  IVirtualProxyConfigJwtAttributeMapItem,
  IVirtualProxyConfigOidcAttributeMapItem,
  IVirtualProxyConfigSamlAttributeMapItem,
  IVirtualProxyUpdate,
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

export interface IClassVirtualProxy {
  remove(): Promise<IHttpStatus>;
  update(arg: IVirtualProxyUpdate): Promise<IHttpStatus>;
  metadataExport(fileName?: string): Promise<Buffer>;
  details: IVirtualProxyConfig;
}

export class VirtualProxy implements IClassVirtualProxy {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: IVirtualProxyConfig;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IVirtualProxyConfig
  ) {
    if (!id) throw new Error(`virtualProxy.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`virtualproxyconfig/${this.id}`)
        .then((res) => res.data as IVirtualProxyConfig);
    }
  }

  public async remove() {
    return await this.repoClient
      .Delete(`virtualproxyconfig/${this.id}`)
      .then((res) => res.status);
  }

  public async update(arg: IVirtualProxyUpdate) {
    if (arg.prefix) this.details.prefix = arg.prefix;
    if (arg.description) this.details.description = arg.description;
    if (arg.sessionCookieHeaderName)
      this.details.sessionCookieHeaderName = arg.sessionCookieHeaderName;
    if (arg.authenticationModuleRedirectUri)
      this.details.authenticationModuleRedirectUri =
        arg.authenticationModuleRedirectUri;
    if (arg.websocketCrossOriginWhiteList)
      this.details.websocketCrossOriginWhiteList =
        arg.websocketCrossOriginWhiteList;
    if (arg.additionalResponseHeaders)
      this.details.additionalResponseHeaders = arg.additionalResponseHeaders;
    if (arg.anonymousAccessMode)
      this.details.anonymousAccessMode = arg.anonymousAccessMode;
    if (arg.windowsAuthenticationEnabledDevicePattern)
      this.details.windowsAuthenticationEnabledDevicePattern =
        arg.windowsAuthenticationEnabledDevicePattern;
    if (arg.loadBalancingServerNodes) {
      this.details.loadBalancingServerNodes =
        await this.parseLoadBalancingNodes(arg.loadBalancingServerNodes);
    }
    if (arg.magicLinkHostUri)
      this.details.magicLinkHostUri = arg.magicLinkHostUri;
    if (arg.magicLinkFriendlyName)
      this.details.magicLinkFriendlyName = arg.magicLinkFriendlyName;
    if (arg.authenticationMethod) {
      this.details.authenticationMethod = parseAuthenticationMethod(
        arg.authenticationMethod
      );
    }
    if (arg.samlMetadataIdP) this.details.samlMetadataIdP = arg.samlMetadataIdP;
    if (arg.samlHostUri) this.details.samlHostUri = arg.samlHostUri;
    if (arg.samlEntityId) this.details.samlEntityId = arg.samlEntityId;
    if (arg.samlAttributeUserId)
      this.details.samlAttributeUserId = arg.samlAttributeUserId;
    if (arg.samlAttributeUserDirectory)
      this.details.samlAttributeUserDirectory = arg.samlAttributeUserDirectory;
    if (arg.samlAttributeMap)
      this.details.samlAttributeMap = parseSamlAttributeMap(
        arg.samlAttributeMap
      );

    if (arg.samlSlo) this.details.samlSlo = arg.samlSlo;
    if (arg.jwtPublicKeyCertificate)
      this.details.jwtPublicKeyCertificate = arg.jwtPublicKeyCertificate;
    if (arg.jwtAttributeUserId)
      this.details.jwtAttributeUserId = arg.jwtAttributeUserId;
    if (arg.jwtAttributeUserDirectory)
      this.details.jwtAttributeUserDirectory = arg.jwtAttributeUserDirectory;
    if (arg.jwtAttributeMap)
      this.details.jwtAttributeMap = parseJwtAttributeMap(arg.jwtAttributeMap);

    if (arg.oidcConfigurationEndpointUri)
      this.details.oidcConfigurationEndpointUri =
        arg.oidcConfigurationEndpointUri;
    if (arg.oidcClientId) this.details.oidcClientId = arg.oidcClientId;
    if (arg.oidcClientSecret)
      this.details.oidcClientSecret = arg.oidcClientSecret;
    if (arg.oidcRealm) this.details.oidcRealm = arg.oidcRealm;
    if (arg.oidcAttributeSub)
      this.details.oidcAttributeSub = arg.oidcAttributeSub;
    if (arg.oidcAttributeName)
      this.details.oidcAttributeName = arg.oidcAttributeName;
    if (arg.oidcAttributeGroups)
      this.details.oidcAttributeGroups = arg.oidcAttributeGroups;
    if (arg.oidcAttributeEmail)
      this.details.oidcAttributeEmail = arg.oidcAttributeEmail;
    if (arg.oidcAttributeClientId)
      this.details.oidcAttributeClientId = arg.oidcAttributeClientId;
    if (arg.oidcAttributePicture)
      this.details.oidcAttributePicture = arg.oidcAttributePicture;
    if (arg.oidcScope) this.details.oidcScope = arg.oidcScope;
    if (arg.oidcAttributeMap)
      this.details.oidcAttributeMap = parseOidcAttributeMap(
        arg.oidcAttributeMap
      );

    return await this.repoClient
      .Put(`virtualproxyconfig/${this.details.id}`, this.details)
      .then((res) => res.status);
  }

  public async metadataExport(fileName?: string) {
    if (!fileName) {
      fileName = `${this.details.prefix}_metadata_sp.xml`;
    }

    let exportMetaData: string = await this.repoClient
      .Get(`virtualproxyconfig/${this.details.id}/generate/samlmetadata`)
      .then((m) => m.data as string);

    return await this.repoClient
      .Get(`download/samlmetadata/${exportMetaData}/${fileName}`)
      .then((m) => m.data as Buffer);
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
