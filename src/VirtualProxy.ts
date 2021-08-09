import { QlikRepositoryClient } from "qlik-rest-api";
import { IEntityRemove } from "./types/interfaces";
import {
  IVirtualProxyConfig,
  IVirtualProxyConfigJwtAttributeMapItem,
  IVirtualProxyConfigSamlAttributeMapItem,
  IVirtualProxyUpdate,
} from "./Proxy.interface";
import {
  IServerNodeConfiguration,
  IServerNodeConfigurationCondensed,
} from "./Nodes";
import { IClassNode, Node } from "./Node";

export interface IClassVirtualProxy {
  remove(): Promise<IEntityRemove>;
  update(arg: IVirtualProxyUpdate): Promise<IVirtualProxyConfig>;
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
    if (!id) throw new Error(`tags.get: "id" parameter is required`);

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
      .then((res) => {
        return { id: this.id, status: res.status } as IEntityRemove;
      });
  }

  // TODO: handle oidc arguments
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
      this.details.authenticationMethod = this.parseAuthenticationMethod(
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
    if (arg.samlAttributeMap) {
      this.details.samlAttributeMap = this.parseSamlAttributeMap(
        arg.samlAttributeMap
      );
    }
    if (arg.samlSlo) this.details.samlSlo = arg.samlSlo;
    if (arg.jwtPublicKeyCertificate)
      this.details.jwtPublicKeyCertificate = arg.jwtPublicKeyCertificate;
    if (arg.jwtAttributeUserId)
      this.details.jwtAttributeUserId = arg.jwtAttributeUserId;
    if (arg.jwtAttributeUserDirectory)
      this.details.jwtAttributeUserDirectory = arg.jwtAttributeUserDirectory;
    if (arg.jwtAttributeMap) {
      this.details.jwtAttributeMap = this.parseJwtAttributeMap(
        arg.jwtAttributeMap
      );
    }

    return await this.repoClient
      .Put(`virtualproxyconfig/${this.details.id}`, this.details)
      .then((res) => {
        return res.data as IVirtualProxyConfig;
      });
  }

  // TODO: move these to separate file. Duplicating in Proxies.ts
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

  private parseAuthenticationMethod(authenticationMethod: string): number {
    if (authenticationMethod == "Ticket") return 0;
    if (authenticationMethod == "static") return 1;
    if (authenticationMethod == "dynamic") return 2;
    if (authenticationMethod == "SAML") return 3;
    if (authenticationMethod == "JWT") return 4;

    return 0;
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
}
