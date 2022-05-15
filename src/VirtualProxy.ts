import { QlikRepositoryClient } from "qlik-rest-api";
import { modifiedDateTime } from "./util/generic";
import { IVirtualProxyConfig, IVirtualProxyUpdate } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
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
  parseSamlAttributeMap,
} from "./util/parseAttributeMap";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassVirtualProxy {
  remove(): Promise<IHttpStatus>;
  update(arg: IVirtualProxyUpdate): Promise<IVirtualProxyConfig>;
  metadataExport(arg?: { fileName: string }): Promise<Buffer>;
  details: IVirtualProxyConfig;
}

export class VirtualProxy implements IClassVirtualProxy {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IVirtualProxyConfig;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IVirtualProxyConfig
  ) {
    if (!id) throw new Error(`virtualProxy.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get(`virtualproxyconfig/${this.#id}`)
        .then((res) => res.data as IVirtualProxyConfig);
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`virtualproxyconfig/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: IVirtualProxyUpdate) {
    this.details.modifiedDate = modifiedDateTime();
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
      this.details.anonymousAccessMode = parseAnonymousAccessMode(
        arg.anonymousAccessMode
      );
    if (arg.windowsAuthenticationEnabledDevicePattern)
      this.details.windowsAuthenticationEnabledDevicePattern =
        arg.windowsAuthenticationEnabledDevicePattern;
    if (arg.loadBalancingServerNodes) {
      this.details.loadBalancingServerNodes =
        await this.parseLoadBalancingNodes(arg.loadBalancingServerNodes);
    }
    if (arg.headerAuthenticationHeaderName)
      this.details.headerAuthenticationHeaderName =
        arg.headerAuthenticationHeaderName;
    if (arg.extendedSecurityEnvironment)
      this.details.extendedSecurityEnvironment =
        arg.extendedSecurityEnvironment;
    if (arg.headerAuthenticationStaticUserDirectory)
      this.details.headerAuthenticationStaticUserDirectory =
        arg.headerAuthenticationStaticUserDirectory;

    if (arg.headerAuthenticationDynamicUserDirectory)
      this.details.headerAuthenticationDynamicUserDirectory =
        arg.headerAuthenticationDynamicUserDirectory;

    if (arg.hasSecureAttributeHttp)
      this.details.hasSecureAttributeHttp = arg.hasSecureAttributeHttp;
    if (arg.hasSecureAttributeHttps)
      this.details.hasSecureAttributeHttps = arg.hasSecureAttributeHttps;

    if (arg.magicLinkHostUri)
      this.details.magicLinkHostUri = arg.magicLinkHostUri;
    if (arg.magicLinkFriendlyName)
      this.details.magicLinkFriendlyName = arg.magicLinkFriendlyName;
    if (arg.authenticationMethod) {
      const authMethod = parseAuthenticationMethod(arg.authenticationMethod);
      if (authMethod == -1)
        throw new Error(
          `virtualProxy.create: "authenticationMethod" not found "${arg.authenticationMethod}"`
        );

      this.details.authenticationMethod = authMethod;
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

    const updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      {}
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put(`virtualproxyconfig/${this.details.id}`, this.details)
      .then((res) => res.data as IVirtualProxyConfig);
  }

  public async metadataExport(arg?: { fileName: string }) {
    if (!arg.fileName) arg.fileName = `${this.details.prefix}_metadata_sp.xml`;

    let exportMetaData: string = await this.#repoClient
      .Get(`virtualproxyconfig/${this.details.id}/generate/samlmetadata`)
      .then((m) => m.data as string);

    return await this.#repoClient
      .Get(`download/samlmetadata/${exportMetaData}/${arg.fileName}`)
      .then((m) => m.data as Buffer);
  }

  private async parseLoadBalancingNodes(
    nodes: string[]
  ): Promise<IServerNodeConfigurationCondensed[]> {
    let existingNodes = await this.#repoClient
      .Get(`servernodeconfiguration/full`)
      .then((res) => res.data as IServerNodeConfiguration[])
      .then((data) => {
        return data.map((t) => {
          return new Node(this.#repoClient, t.id, t);
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
