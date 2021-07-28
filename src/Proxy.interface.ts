import { ICustomPropertyCondensed } from "./CustomProperty";
import { ITagCondensed } from "./Tag";
import {
  IServerNodeConfiguration,
  IServerNodeConfigurationCondensed,
} from "./Node";

export interface IVirtualProxyUpdate {
  id: string;
  prefix?: string;
  description?: string;
  sessionCookieHeaderName?: string;
  authenticationModuleRedirectUri?: string;
  windowsAuthenticationEnabledDevicePattern?: string;
  loadBalancingServerNodes?: string[];
  websocketCrossOriginWhiteList?: string[];
  additionalResponseHeaders?: string;
  anonymousAccessMode?: number;
  magicLinkHostUri?: string;
  magicLinkFriendlyName?: string;
  authenticationMethod?:
    | "Ticket"
    | "HeaderStaticUserDirectory"
    | "HeaderDynamicUserDirectory"
    | "static"
    | "dynamic"
    | "SAML"
    | "JWT";
  samlMetadataIdP?: string;
  samlHostUri?: string;
  samlEntityId?: string;
  samlAttributeUserId?: string;
  samlAttributeUserDirectory?: string;
  samlAttributeMap?: string[];
  samlSlo?: boolean;
  jwtPublicKeyCertificate?: string;
  jwtAttributeUserId?: string;
  jwtAttributeUserDirectory?: string;
  jwtAttributeMap?: string[];
  sessionInactivityTimeout?: number;
  tags?: string[];
  customProperties?: string[];
}

export interface IProxyCreate {
  prefix?: string;
  description: string;
  sessionCookieHeaderName: string;
  authenticationModuleRedirectUri?: string;
  loadBalancingServerNodes?: string[];
  websocketCrossOriginWhiteList?: string;
  additionalResponseHeaders?: string;
  authenticationMethod?:
    | "Ticket"
    | "HeaderStaticUserDirectory"
    | "HeaderDynamicUserDirectory"
    | "static"
    | "dynamic"
    | "SAML"
    | "JWT";
  samlMetadataIdP?: string;
  samlHostUri?: string;
  samlEntityId?: string;
  samlAttributeUserId?: string;
  samlAttributeUserDirectory?: string;
  samlAttributeMap?: string[];
  samlSlo?: boolean;
  // samlSigningAlgorithm?: "sha1" | "sha256",
  jwtPublicKeyCertificate?: string;
  jwtAttributeUserId?: string;
  jwtAttributeUserDirectory?: string;
  jwtAttributeMap?: string[];
  sessionInactivityTimeout?: number;
}

export interface IProxyUpdate {
  id: string;
  listenPort?: number;
  allowHttp?: boolean;
  unencryptedListenPort?: number;
  authenticationListenPort?: number;
  kerberosAuthentication?: boolean;
  unencryptedAuthenticationListenPort?: number;
  sslBrowserCertificateThumbprint?: string;
  keepAliveTimeoutSeconds?: number;
  maxHeaderSizeBytes?: number;
  maxHeaderLines?: number;
  restListenPort?: number;
  customProperties?: string[];
  tags?: string[];
  virtualProxies?: string[];
}

export interface IProxyServiceCondensed {
  id?: string;
  privileges: string[];
}

export interface IProxyService extends IProxyServiceCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  customProperties?: ICustomPropertyCondensed[];
  tags?: ITagCondensed[];
  serverNodeConfiguration: IServerNodeConfiguration;
  settings: IProxyServiceSettings;
}

export interface IVirtualProxyConfigAttributeMapItem {
  id?: string;
  privileges?: string[];
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  senseAttribute: string;
  isMandatory: boolean;
}

export interface IVirtualProxyConfigSamlAttributeMapItem
  extends IVirtualProxyConfigAttributeMapItem {
  samlAttribute: string;
}

export interface IVirtualProxyConfigJwtAttributeMapItem
  extends IVirtualProxyConfigAttributeMapItem {
  jwtAttribute: string;
}

export interface IVirtualProxyConfigOidcAttributeMapItem
  extends IVirtualProxyConfigAttributeMapItem {
  oidcAttribute: string;
}

export interface IVirtualProxyConfigCondensed {
  id?: string;
  privileges?: string[];
  prefix?: string;
  description?: string;
  authenticationModuleRedirectUri?: string;
  sessionModuleBaseUri?: string;
  loadBalancingModuleBaseUri?: string;
  useStickyLoadBalancing?: boolean;
  loadBalancingServerNodes: IServerNodeConfigurationCondensed[];
  authenticationMethod?: number;
  headerAuthenticationMode?: number;
  headerAuthenticationHeaderName?: string;
  headerAuthenticationStaticUserDirectory?: string;
  headerAuthenticationDynamicUserDirectory?: string;
  anonymousAccessMode?: number;
  windowsAuthenticationEnabledDevicePattern?: string;
  sessionCookieHeaderName: string;
  sessionCookieDomain?: string;
  hasSecureAttributeHttps?: boolean;
  sameSiteAttributeHttps?: number;
  hasSecureAttributeHttp?: boolean;
  sameSiteAttributeHttp?: number;
  additionalResponseHeaders?: string;
  sessionInactivityTimeout?: number;
  extendedSecurityEnvironment?: boolean;
  websocketCrossOriginWhiteList?: string[];
  defaultVirtualProxy: boolean;
  tags?: ITagCondensed[];
  samlMetadataIdP?: string;
  samlHostUri?: string;
  samlEntityId?: string;
  samlAttributeUserId?: string;
  samlAttributeUserDirectory?: string;
  samlAttributeSigningAlgorithm?: number;
  samlAttributeMap?: IVirtualProxyConfigSamlAttributeMapItem[];
  jwtAttributeUserId?: string;
  jwtAttributeUserDirectory?: string;
  jwtAudience?: string;
  jwtPublicKeyCertificate?: string;
  jwtAttributeMap?: IVirtualProxyConfigJwtAttributeMapItem[];
  magicLinkHostUri?: string;
  magicLinkFriendlyName?: string;
  samlSlo?: boolean;
  oidcConfigurationEndpointUri?: string;
  oidcClientId?: string;
  oidcClientSecret?: string;
  oidcRealm?: string;
  oidcAttributeSub?: string;
  oidcAttributeName?: string;
  oidcAttributeGroups?: string;
  oidcAttributeEmail?: string;
  oidcAttributeClientId?: string;
  oidcAttributePicture?: string;
  oidcScope?: string;
  oidcAttributeMap?: IVirtualProxyConfigOidcAttributeMapItem[];
}

export interface IVirtualProxyConfig extends IVirtualProxyConfigCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  customProperties: ICustomPropertyCondensed;
}

export interface IProxyServiceSettingsLogVerbosity {
  id?: string;
  privileges: string[];
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  logVerbosityAuditActivity?: number;
  logVerbosityAuditSecurity?: number;
  logVerbosityService?: number;
  logVerbosityAudit?: number;
  logVerbosityPerformance?: number;
  logVerbositySecurity?: number;
  logVerbositySystem?: number;
}

export interface IProxyServiceSettings {
  id?: string;
  privileges: string[];
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  listenPort: number;
  allowHttp?: boolean;
  unencryptedListenPort: number;
  authenticationListenPort: number;
  kerberosAuthentication?: boolean;
  unencryptedAuthenticationListenPort: number;
  sslBrowserCertificateThumbprint?: string;
  keepAliveTimeoutSeconds?: number;
  maxHeaderSizeBytes?: number;
  maxHeaderLines?: number;
  logVerbosity: IProxyServiceSettingsLogVerbosity;
  useWsTrace?: boolean;
  performanceLoggingInterval?: number;
  restListenPort: number;
  virtualProxies?: IVirtualProxyConfigCondensed[];
  formAuthenticationPageTemplate?: string;
  loggedOutPageTemplate?: string;
  errorPageTemplate?: string;
}
