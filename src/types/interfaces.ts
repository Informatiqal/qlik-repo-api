import { ReadStream } from "fs";
import { ExecutionResultDetail } from "../ExecutionResultDetail";
import {
  TRangeOf5,
  TRangeOf100,
  TRangeOf256,
  TTimeZones,
  TDaysOfMonth,
  TDaysOfWeek,
  TRepeatOptions,
  TDataConnectionArchitecture,
  TDataConnectionLogOn,
  IHttpStatus,
  TCustomPropObjectTypes,
  TCertificateExportFormat,
  TEngineLoadBalancingPurpose,
  TEngineWorkingSetSizeMode,
  TUserDirectoryTypes,
  TSystemRuleCategory,
  TSystemRuleContext,
  TSystemRuleActions,
  TSystemRuleType,
  TTaskTriggerCompositeState,
  TSchedulerServiceType,
} from "./ranges";
import { IncomingMessage } from "http";

export interface IHttpReturn {
  status: number;
  statusText: string;
  data: any;
}

export interface IEntityRemove {
  /**
   * `ID` of the removed object
   */
  id: string;
  /**
   * `HTTP` response status. If the object is successfully removed the status will be `204`
   */
  status: IHttpStatus;
}

export interface IFileExtensionWhiteListCondensed {
  id: string;
  privileges: string[];
  libraryType: string;
}

export interface IStaticContentReferenceCondensed {
  id: string;
  privileges: string[];
  dataLocation: string;
  logicalPath: string;
  externalPath: string;
  serveOptions: string;
}

// export interface IAppExportResponse {
//   exportToken: string;
//   downloadPath: string;
//   schemaPath: string;
//   appId: string;
//   cancelled: boolean;
// }

export interface IAbout {
  buildDate: string;
  buildVersion: string;
  databaseProvider: string;
  nodeType: number;
  requiresBootstrap: boolean;
  schemaPath: string;
  sharedPersistence: boolean;
  singleNodeOnly: boolean;
}

export interface ISelectionItem {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  schemaPath?: string;
  type: string;
  objectID: string;
  objectName?: string;
}

export interface ISelection {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  schemaPath?: string;
  privileges?: string[];
  items?: ISelectionItem[];
}

export interface IUpdateObjectOptions {
  // appendCustomProps?: boolean;
  // appendTags?: boolean;
  customPropertyOperation?: TAddRemoveSet;
  tagOperation?: TAddRemoveSet;
}

export interface IUpdateVirtualProxyOptions extends IUpdateObjectOptions {
  whitelistOperation?: "set" | "add" | "remove";
}

export interface IUpdateProxyOptions extends IUpdateObjectOptions {
  virtualProxyOperation?: "set" | "add" | "remove";
}

export interface IAppUpdate {
  /**
   * Application new name
   */
  name?: string;
  /**
   * Application new description
   */
  description?: string;
  /**
   * Array of tags to be applied.
   */
  tags?: string[];
  /**
   * In format `["cpName=value1", "cpName=value2", "otherCpName=value123", ...]`
   */
  customProperties?: string[];
  /**
   * In format `USER_DIRECTORY/USER_ID`
   */
  owner?: string;
  /**
   * Stream name
   */
  stream?: string;
}

export interface IAppUploadAndReplace {
  name: string;
  targetAppId: string;
  file: Buffer | ReadStream;
  keepData?: boolean;
  customProperties?: string[];
  tags?: string[];
}

export interface IAppUpload {
  name: string;
  file: Buffer | ReadStream | IncomingMessage | WritableStream;
  keepData?: boolean;
  excludeDataConnections?: boolean;
  tags?: string[];
  customProperties?: string[];
}

export interface IAppCondensed {
  appId: string;
  availabilityStatus: {};
  id?: string;
  migrationHash: string;
  name: string;
  privileges?: string[];
  published: boolean;
  publishTime: string;
  savedInProductVersion: string;
  stream: IStream;
}

export interface IApp extends IAppCondensed {
  createdDate: string;
  customProperties: ICustomPropertyValue[];
  description: string;
  dynamicColor: string;
  fileSize: number;
  lastReloadTime: string;
  modifiedDate: string;
  owner: IOwner;
  schemaPath: string;
  sourceAppId: string;
  tags: ITagCondensed[];
  targetAppId: string;
  thumbnail: string;
}

export interface IStreamCreate {
  name: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IStreamUpdate {
  // id: string;
  name?: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IStreamCondensed {
  id: string;
  name: string;
  privileges: [];
}

export interface IStream extends IStreamCondensed {
  createdDate: string;
  modifiedDate: string;
  modifiedByUserName?: string;
  schemaPath: string;
  customProperties: ICustomPropertyCondensed[];
  owner: IOwner;
  tags: ITagCondensed[];
}

export interface ICustomPropertyCreate {
  name: string;
  description?: string;
  choiceValues?: string[];
  objectTypes?: TCustomPropObjectTypes[];
  valueType?: string;
}

export interface ICustomPropertyUpdate {
  name?: string;
  description?: string;
  choiceValues?: string[];
  objectTypes?: TCustomPropObjectTypes[];
  valueType?: string;
}

export interface ICustomPropertyValue {
  createdDate: string;
  schemaPath: string;
  modifiedDate: string;
  definition: {
    privileges: [];
    valueType: string;
    name: string;
    choiceValues: string[];
    id: string;
  };
  id: string;
  value: string;
}

export interface ICustomPropertyCondensed {
  privileges: string[];
  valueType: string;
  name: string;
  choiceValues: string[];
  id: string;
}

export interface ICustomProperty extends ICustomPropertyCondensed {
  createdDate: string;
  schemaPath: string;
  modifiedDate: string;
  description: string;
  objectTypes: TCustomPropObjectTypes[];
}

export interface ITagCondensed {
  privileges: string[];
  name: string;
  id: string;
}

export interface ITag extends ITagCondensed {
  createdDate: string;
  schemaPath: string;
  modifiedDate: string;
}

export interface IUserCondensed {
  privileges: string[];
  userDirectoryConnectorName: string;
  userDirectory: string;
  userId: string;
  name: string;
  id: string;
}

export interface IUserAttributes {
  createdDate: string;
  attributeValue: string;
  attributeType: string;
  schemaPath: string;
  modifiedDate: string;
  externalId: string;
  id: string;
}

export interface IUser extends IUserCondensed {
  removedExternally: boolean;
  schemaPath: string;
  roles: string[];
  deleteProhibited: boolean;
  tags: ITagCondensed[];
  blacklisted: boolean;
  createdDate: string;
  customProperties: ICustomPropertyValue[];
  inactive: boolean;
  modifiedDate: string;
  attributes: IUserAttributes[];
}
export interface IUserUpdate {
  // id: string;
  tags?: string[];
  customProperties?: string[];
  name?: string;
  roles?: string[];
}

export interface IUserCreate {
  userId: string;
  userDirectory: string;
  name?: string;
  roles?: string[];
  tags?: string[];
  customProperties?: string[];
}

export interface IOwner {
  privileges: [];
  userDirectory: string;
  userDirectoryConnectorName: string;
  name: string;
  id: string;
  userId: string;
}

export interface IAppObjectUpdate {
  owner?: string;
  approved?: boolean;
}

export interface IAppObjectCondensed {
  id?: string;
  privileges?: string[];
  name?: string;
  engineObjectId?: string;
  contentHash?: string;
  engineObjectType?: string;
  description?: string;
  objectType?: string;
  publishTime?: string;
  published?: boolean;
}

export interface IAppObject extends IAppObjectCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  owner: IUserCondensed;
  tags: ITagCondensed[];
  app: IAppCondensed;
  size?: number;
  attributes: string;
  approved?: boolean;
  sourceObject: string;
  draftObject: string;
  appObjectBlobId: string;
}

export interface ICertificateExportParameters {
  machineNames: string[];
  certificatePassword?: string;
  includeSecretsKey?: boolean;
  exportFormat?: TCertificateExportFormat;
  includeCa?: boolean;
}

export interface IContentLibraryFile {
  name: string;
  path: string;
  file: Buffer | IncomingMessage;
}

export interface IContentLibraryUpdate {
  name?: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IContentLibraryCondensed {
  privileges: string[];
  name: string;
  id: string;
  type: string;
}

export interface IContentLibrary extends IContentLibraryCondensed {
  createdDate: string;
  modifiedDate: string;
  schemaPath: string;
  customProperties: ICustomPropertyValue[];
  owner: IOwner;
  tags: ITagCondensed[];
  whiteList: IFileExtensionWhiteListCondensed;
  references: IStaticContentReferenceCondensed[];
}

export interface IContentLibraryCreate {
  name: string;
  customProperties?: string[];
  tags?: string[];
  owner?: string;
}

export interface IContentLibraryImport {
  file: Buffer | ReadStream;
  externalPath: string;
  overwrite?: boolean;
}

export interface IDataConnectionCondensed {
  id?: string;
  privileges?: string[];
  name: string;
  connectionstring: string;
  type?: string;
  engineObjectId?: string;
  username?: string;
  password?: string;
  logOn?: number;
  architecture?: number;
}

export interface IDataConnection extends IDataConnectionCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  customProperties: ICustomPropertyValue[];
  tags: ITagCondensed[];
  owner: IUserCondensed;
}

export interface IDataConnectionCreate {
  name: string;
  connectionString: string;
  owner?: string;
  type?: string;
  username?: string;
  password?: string;
  architecture?: TDataConnectionArchitecture;
  logOn?: TDataConnectionLogOn;
  tags?: string[];
  customProperties?: string[];
}

export interface IDataConnectionUpdate {
  connectionString?: string;
  username?: string;
  password?: string;
  owner?: string;
  tags?: string[];
  customProperties?: string[];
}

export interface IEngineGetValid {
  proxyID?: string;
  proxyPrefix?: string;
  appId?: string;
  loadBalancingPurpose?: TEngineLoadBalancingPurpose;
}

export interface IEngineUpdate {
  workingSetSizeMode?: TEngineWorkingSetSizeMode;
  workingSetSizeLoPct?: TRangeOf100;
  workingSetSizeHiPct?: TRangeOf100;
  cpuThrottlePercentage?: TRangeOf100;
  coresToAllocate?: TRangeOf256;
  allowDataLineage?: boolean;
  standardReload?: boolean;
  documentDirectory?: string;
  auditSecurityLogVerbosity?: TRangeOf5;
  systemLogVerbosity?: TRangeOf5;
  externalServicesLogVerbosity?: TRangeOf5;
  qixPerformanceLogVerbosity?: TRangeOf5;
  httpTrafficLogVerbosity?: TRangeOf5;
  auditLogVerbosity?: TRangeOf5;
  trafficLogVerbosity?: TRangeOf5;
  sessionLogVerbosity?: TRangeOf5;
  performanceLogVerbosity?: TRangeOf5;
  sseLogVerbosity?: TRangeOf5;
  listenerPorts?: number[];
  globalLogMinuteInterval?: number;
  autosaveInterval?: number;
  documentTimeout?: number;
  genericUndoBufferMaxSize?: number;
  auditActivityLogVerbosity?: TRangeOf5;
  serviceLogVerbosity?: TRangeOf5;
  qrsHttpNotificationPort?: number;
  hyperCubeMemoryLimit?: number;
  reloadMemoryLimit?: number;
  exportMemoryLimit?: number;
  objectTimeLimitSec?: number;
  exportTimeLimitSec?: number;
  reloadTimeLimitSec?: number;
  createSearchIndexOnReloadEnabled?: boolean;
}

export interface IEngineGetValidResult {
  schemaPath?: string;
  loadBalancingResultCode?: number;
  appID?: string;
  validEngines?: string[];
}

export interface IEngineCondensed {
  id: string;
  privileges: string[];
}

export interface IEngineSettings {
  id: string;
  createdDate: string;
  modifiedDate: string;
  listenerPorts: number[];
  overlayDocuments: boolean;
  autosaveInterval: number;
  documentTimeout: number;
  tableFilesDirectory: string;
  documentDirectory: string;
  genericUndoBufferMaxSize: number;
  qvLogEnabled: boolean;
  globalLogMinuteInterval: number;
  auditActivityLogVerbosity: number;
  auditSecurityLogVerbosity: number;
  serviceLogVerbosity: number;
  systemLogVerbosity: number;
  performanceLogVerbosity: number;
  httpTrafficLogVerbosity: number;
  externalServicesLogVerbosity: number;
  qixPerformanceLogVerbosity: number;
  auditLogVerbosity: number;
  sessionLogVerbosity: number;
  trafficLogVerbosity: number;
  sseLogVerbosity: number;
  allowDataLineage: boolean;
  workingSetSizeLoPct: number;
  workingSetSizeHiPct: number;
  workingSetSizeMode: number;
  cpuThrottlePercentage: number;
  standardReload: boolean;
  maxCoreMaskPersisted: number;
  maxCoreMask: number;
  maxCoreMaskHiPersisted: number;
  maxCoreMaskHi: number;
  maxCoreMaskGrp1Persisted: number;
  maxCoreMaskGrp1: number;
  maxCoreMaskGrp1HiPersisted: number;
  maxCoreMaskGrp1Hi: number;
  maxCoreMaskGrp2Persisted: number;
  maxCoreMaskGrp2: number;
  maxCoreMaskGrp2HiPersisted: number;
  maxCoreMaskGrp2Hi: number;
  maxCoreMaskGrp3Persisted: number;
  maxCoreMaskGrp3: number;
  maxCoreMaskGrp3HiPersisted: number;
  maxCoreMaskGrp3Hi: number;
  objectTimeLimitSec: number;
  exportTimeLimitSec: number;
  reloadTimeLimitSec: number;
  createSearchIndexOnReloadEnabled: boolean;
  hyperCubeMemoryLimit: number;
  exportMemoryLimit: number;
  reloadMemoryLimit: number;
  qrsHttpNotificationPort: number;
  schemaPath: string;
}

export interface IEngine {
  id: string;
  createdDate: string;
  modifiedDate: string;
  customProperties: ICustomPropertyCondensed[];
  tags: ITagCondensed[];
  privileges: string[];
  schemaPath: string;
  settings: IEngineSettings;
  serverNodeConfiguration: IServerNodeConfigurationCondensed;
}

export interface IServerNodeConfiguration {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  customProperties?: ICustomPropertyCondensed[];
  tags?: ITagCondensed[];
  name: string;
  hostName: string;
  isCentral?: boolean;
  nodePurpose?: number;
  engineEnabled?: boolean;
  proxyEnabled?: boolean;
  printingEnabled?: boolean;
  schedulerEnabled?: boolean;
  temporaryfilepath: string;
  failoverCandidate?: boolean;
  serviceCluster: {
    id: string;
    name: string;
    privileges: string[];
  };
  roles: {
    id: string;
    definition: number;
    privileges: string[];
  }[];
  schedulerReloadEnabled: boolean;
  schedulerPreloadEnabled: boolean;
}

export interface IServerNodeResultContainer {
  schemaPath?: string;
  configuration?: IServerNodeConfigurationCondensed;
  repositoryServiceID?: string;
  engineServiceID?: string;
  proxyServiceID?: string;
  schedulerServiceID?: string;
  printingServiceID?: string;
}

export interface IServerNodeConfigurationCondensed {
  id: string;
  name: string;
  hostName: string;
  temporaryfilepath: string;
  privileges: string[];
  serviceCluster: {
    id: string;
    name: string;
    privileges: string[];
  };
  roles: {
    id: string;
    definition: number;
    privileges: string[];
  }[];
}

export interface INodeUpdate {
  name?: string;
  nodePurpose?:
    | "Production"
    | "Development"
    | "Both"
    | "ProductionAndDevelopment";
  engineEnabled?: boolean;
  proxyEnabled?: boolean;
  schedulerEnabled?: boolean;
  printingEnabled?: boolean;
  failoverCandidate?: boolean;
  tags?: string[];
  customProperties?: string[];
  schedulerReloadEnabled?: boolean;
  schedulerPreloadEnabled?: boolean;
}

export interface INodeCreate {
  hostName: string;
  name: string;
  nodePurpose?:
    | "Production"
    | "Development"
    | "Both"
    | "ProductionAndDevelopment";
  engineEnabled?: boolean;
  proxyEnabled?: boolean;
  schedulerEnabled?: boolean;
  printingEnabled?: boolean;
  failoverCandidate?: boolean;
  tags?: string[];
  customProperties?: string[];
  schedulerReloadEnabled?: boolean;
  schedulerPreloadEnabled?: boolean;
}

export interface IExtensionCondensed {
  id: string;
  privileges: string[];
  name: string;
}

export interface IExtension extends IExtensionCondensed {
  createdDate: string;
  modifiedDate: string;
  schemaPath: string;
  customProperties: ICustomPropertyCondensed[];
  owner: IOwner;
  tags: ITagCondensed[];
  whiteList: IFileExtensionWhiteListCondensed;
  references: IStaticContentReferenceCondensed[];
}

export interface IExtensionUpdate {
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IExtensionImport {
  file: Buffer | ReadStream;
  password?: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IAccessTypesInfoAccessTypeCondensed {
  schemaPath?: string;
  tokenCost?: number;
  allocatedTokens?: number;
  usedTokens?: number;
  quarantinedTokens?: number;
}

export interface IAccessTypeInfo {
  schemaPath?: string;
  totalTokens?: number;
  availableTokens?: number;
  professionalAccessType?: IAccessTypesInfoAccessTypeCondensed;
  userAccessType?: IAccessTypesInfoAccessTypeCondensed;
  loginAccessType?: IAccessTypesInfoAccessTypeCondensed;
  analyzerAccessType?: IAccessTypesInfoAccessTypeCondensed;
}

export interface ILicense {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  lef?: string;
  serial?: string;
  check?: string;
  key?: string;
  name?: string;
  organization?: string;
  product?: number;
  numberOfCores?: number;
  isExpired?: boolean;
  expiredReason?: string;
  isBlacklisted?: boolean;
  isInvalid?: boolean;
  isSubscription?: boolean;
  isCloudServices?: boolean;
  isElastic?: boolean;
}

export interface ILicenseAccessTypeCondensed {
  id?: string;
  privileges?: string[];
}

export interface IAuditUserCondensed {
  schemaPath?: string;
  userId?: string;
  userDirectory?: string;
  name?: string;
}
export interface IAuditResourceCondensed {
  schemaPath?: string;
  id?: string;
  name?: string;
}

export interface IAuditRuleCondensed {
  schemaPath?: string;
  id?: string;
  name?: string;
  actions?: number;
  disabled?: boolean;
}

export interface ISystemRuleApplicationItemCondensed {
  schemaPath?: string;
  userID?: string;
  resourceID?: string;
  ruleID?: string;
  allowed?: boolean;
  errorAt?: number;
  errorMessage?: string;
  evaluationState?: number;
}

export interface IAudit {
  schemaPath?: string;
  users?: IAuditUserCondensed[];
  resources: IAuditResourceCondensed[];
  rules?: IAuditRuleCondensed[];
  ruleApplication?: ISystemRuleApplicationItemCondensed[];
}

export interface ILicenseAccessGroup {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  name?: string;
}

export interface IAuditParameters {
  resourceId?: string;
  resourceType?: string;
  resourceFilter?: string;
  userFilter?: string;
  environmentAttributes?: string;
  userSkip?: number;
  userTake?: number;
  resourceSkip?: number;
  resourceTake?: number;
  includeNonGrantingRules?: boolean;
}

interface ILicenseBase {
  name: string;
  organization?: string;
}

export interface ILicenseSetSerial extends ILicenseBase {
  serial: string;
  control: string;
  lef: string;
}

export interface ILicenseSetKey extends ILicenseBase {
  key: string;
}

export type IObject =
  | IApp
  | IAppObject
  | IContentLibrary
  | ICustomProperty
  | IDataConnection
  | IEngine
  | IExtension
  | IStream
  | ISystemRule
  | ITag
  | ITask
  | IUser
  | IUserDirectory
  | any;

export interface IVirtualProxyUpdate {
  name?: string;
  // id: string;
  prefix?: string;
  description?: string;
  sessionCookieHeaderName?: string;
  authenticationModuleRedirectUri?: string;
  windowsAuthenticationEnabledDevicePattern?: string;
  loadBalancingServerNodes?: string[];
  websocketCrossOriginWhiteList?: string[];
  additionalResponseHeaders?: string;
  // anonymousAccessMode?: number;
  anonymousAccessMode?: "No anonymous" | "Allow anonymous" | "Always anonymous";
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
  hasSecureAttributeHttp?: boolean;
  sameSiteAttributeHttp?: "No attribute" | "None" | "Lax" | "Strict";
  hasSecureAttributeHttps?: boolean;
  sameSiteAttributeHttps?: "No attribute" | "None" | "Lax" | "Strict";
  headerAuthenticationHeaderName?: string;
  extendedSecurityEnvironment?: boolean;
  headerAuthenticationStaticUserDirectory?: string;
  headerAuthenticationDynamicUserDirectory?: string;
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
  oidcAttributeMap?: string[];
}

export interface IVirtualProxyCreate {
  // name: string;
  customProperties?: string[];
  tags?: string[];
  prefix: string;
  sessionCookieHeaderName: string;
  description: string;
  authenticationModuleRedirectUri?: string;
  windowsAuthenticationEnabledDevicePattern?: string;
  loadBalancingServerNodes?: string[];
  websocketCrossOriginWhiteList?: string[];
  additionalResponseHeaders?: string;
  anonymousAccessMode?: "No anonymous" | "Allow anonymous" | "Always anonymous";
  authenticationMethod?:
    | "Ticket"
    | "HeaderStaticUserDirectory"
    | "HeaderDynamicUserDirectory"
    | "static"
    | "dynamic"
    | "SAML"
    | "JWT";
  hasSecureAttributeHttp?: boolean;
  sameSiteAttributeHttp?: "No attribute" | "None" | "Lax" | "Strict";
  hasSecureAttributeHttps?: boolean;
  sameSiteAttributeHttps?: "No attribute" | "None" | "Lax" | "Strict";
  headerAuthenticationHeaderName?: string;
  extendedSecurityEnvironment?: boolean;
  headerAuthenticationStaticUserDirectory?: string;
  headerAuthenticationDynamicUserDirectory?: string;
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
  oidcAttributeMap?: string[];
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
  oidcAttributeMap?: string[];
  tags?: string[];
  customProperties?: string[];
}

export interface IProxyUpdate {
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
  tags?: string[];
  customProperties?: string[];
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
  // anonymousAccessMode?: "No anonymous" | "Allow anonymous" | "Always anonymous";
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
  customProperties: ICustomPropertyValue[];
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

export interface IUserDirectoryCondensed {
  id?: string;
  privileges?: string[];
  name: string;
  type: TUserDirectoryTypes;
}

export interface IUserDirectorySettings {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  name?: string;
  category?: string;
  userDirectorySettingType?: number;
  secret?: boolean;
  value?: string;
  secretValue?: string;
}

export interface IUserDirectory extends IUserDirectoryCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  userDirectoryName?: string;
  configured?: boolean;
  operational?: boolean;
  syncOnlyLoggedInUsers: boolean;
  syncStatus: boolean;
  syncLastStarted?: string;
  syncLastSuccessfulEnded?: string;
  configuredError?: string;
  operationalError?: string;
  tags: ITagCondensed[];
  creationType: number;
  settings?: IUserDirectorySettings[];
}

export interface IUserDirectoryUpdate {
  name?: string;
  userDirectoryName?: string;
  syncOnlyLoggedInUsers?: boolean;
  tags?: string[];
  settings?: IUserDirectorySettingItem[];
}

export interface IUserDirectoryCreate {
  name: string;
  userDirectoryName: string;
  type: TUserDirectoryTypes;
  syncOnlyLoggedInUsers?: boolean;
  tags?: string[];
  settings?: IUserDirectorySettingItem[];
}

export interface IUserDirectorySettingItem {
  name:
    | "Path"
    | "User name"
    | "Password"
    | "LDAP Filter"
    | "Synchronization timeout in seconds"
    | "Page size"
    | "Auth type"
    | "User directory name"
    | "Host"
    | "Connection timeout in seconds"
    | "Base DN"
    | "Use optimized query"
    | "Flags"
    | "Locator Flags"
    | "Protocol Version"
    | "Sasl Method"
    | "Certificate path"
    | "Attribute name of node type"
    | "Attribute value of node type identifying a user"
    | "Attribute value of node type identifying a group"
    | "Attribute name of account"
    | "Attribute name of email"
    | "Attribute name of display name"
    | "Attribute name of group membership"
    | "Attribute name of members of node"
    | "Custom Attributes"
    | "Users table"
    | "Attributes table"
    | "Connection string part 1"
    | "Connection string part 2 (secret)";
  secret?: boolean;
  userDirectorySettingType: "String" | "Int" | "Bool";
  value: string;
  secretValue?: string;
}

export interface ISystemRuleCondensed {
  id?: string;
  privileges?: string[];
  category: TSystemRuleCategory;
  subcategory?: string;
  type: "Custom";
  name: string;
  rule: string;
  resourceFilter: string;
  actions: number;
  comment?: string;
  disabled?: boolean;
}

export interface ISystemRule extends ISystemRuleCondensed {
  createdDate?: string;
  modifiedDate?: string;
  schemaPath?: string;
  ruleContext: number;
  seedId?: string;
  version?: number;
  tags?: ITagCondensed[];
}

export interface ISystemRuleCreate {
  name: string;
  category: TSystemRuleCategory;
  rule: string;
  resourceFilter: string;
  context?: TSystemRuleContext;
  actions: TSystemRuleActions[];
  comment?: string;
  disabled?: boolean;
  tags?: string[];
  customProperties?: string[];
}

export interface ISystemRuleLicenseCreate {
  name: string;
  type: TSystemRuleType;
  rule: string;
  comment?: string;
  disabled?: boolean;
  tags?: string[];
  customProperties?: string[];
}

export interface ISystemRuleUpdate {
  // id: string;
  name?: string;
  category?: TSystemRuleCategory;
  rule?: string;
  resourceFilter?: string;
  context?: TSystemRuleContext;
  actions?: TSystemRuleActions[];
  comment?: string;
  disabled?: boolean;
  tags?: string[];
  customProperties?: string[];
}

export interface ISystemRuleAuditGet {
  schemaPath?: string;
  resourceType?: string;
  resourceFilter?: string;
  userFilter?: string;
  environmentAttribute?: string;
  userSkip?: number;
  userTake?: number;
  resourceSkip?: number;
  resourceTake?: number;
  includeNonGrantingRules?: boolean;
}

export interface ITaskCreate {
  name: string;
  appId?: string;
  appFilter?: string;
  tags?: string[];
  customProperties?: string[];
  preloadNodes?: string[];
  timeToLive?: number;
  isPartialReload?: boolean;
}

export interface IExternalTaskCreate {
  name: string;
  path: string;
  parameters?: string;
  tags?: string[];
  customProperties?: string[];
}

export interface ITaskReloadUpdate {
  // id: string;
  name?: string;
  enabled?: boolean;
  taskSessionTimeout?: number;
  maxRetries?: number;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
  appId?: string;
  appFilter?: string;
  preloadNodes?: string[];
  timeToLive?: number;
  isPartialReload?: boolean;
}

export interface ITaskExternalUpdate {
  // id: string;
  name?: string;
  enabled?: boolean;
  taskSessionTimeout?: number;
  maxRetries?: number;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
  path?: string;
  parameters?: string;
}

export type TaskType = "reload" | "userSync" | "external";
export type TaskTypeFull =
  | "reloadTask"
  | "userSyncTask"
  | "externalProgramTask";

export type TaskIdOrFilter =
  | { id: string; filter?: never }
  | { id?: never; filter: string };

export type EventTasks = {
  state: TTaskTriggerCompositeState;
  // taskType?: TaskType;
} & TaskIdOrFilter;

export interface ITaskCreateTriggerCompositeBase {
  name: string;
  eventTasks: EventTasks[];
  enabled?: boolean;
  timeConstraint?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export interface ITaskCreateTriggerComposite
  extends ITaskCreateTriggerCompositeBase {
  task: TaskIdOrFilter;
}

export interface ITaskUpdateTriggerComposite {
  /**
   * Enable/disable the trigger true or false
   */
  enabled?: boolean;
  /**
   * Name of the trigger
   */
  name?: string;
  /**
   * (Composite events) Array of Reload task(s) on which this trigger is depending
   */
  eventTask?: {
    /**
     * Reload task ID
     */
    id?: string;
    /**
     * Reload task Name. If ID is provided this is not required
     */
    name?: string;
    /**
     * Trigger on the state of the task "success" or "fail"
     */
    state: TTaskTriggerCompositeState;
  }[];
}

export interface ITaskCreateTriggerSchemaBase {
  // reloadTaskId: string;
  enabled?: boolean;
  name: string;
  repeat: TRepeatOptions;
  repeatEvery?: number;
  startDate?: string;
  expirationDate?: string;
  daysOfWeek?: TDaysOfWeek[];
  daysOfMonth?: TDaysOfMonth[];
  timeZone?: TTimeZones;
  daylightSavingTime?:
    | "ObserveDaylightSavingTime"
    | "PermanentStandardTime"
    | "PermanentDaylightSavingTime";
}

export interface ITaskCreateTriggerSchema extends ITaskCreateTriggerSchemaBase {
  task: TaskIdOrFilter;
}

export interface ITaskUpdateTriggerSchema {
  /**
   * Enable/disable the trigger true or false
   */
  enabled?: boolean;
  /**
   * Name of the trigger
   */
  name?: string;
  /**
   * (Schema events) Schedule of the task "Once", "Minute", "Hourly", "Daily", "Weekly", "Monthly"
   */
  repeat?: TRepeatOptions;
  /**
   * (Schema events) How often to repeat the task 1,2,3 ... no applied when "Once" or "Monthly"
   */
  repeatEvery?: number;
  /**
   * (Schema events) When will be the first timestamp to start the trigger. Default is current timestamp
   */
  startDate?: string;
  /**
   * (Schema events) When will be the last timestamp to start the trigger. Default is 9999-01-01T00:00:00.000
   */
  expirationDate?: string;
  /**
   * (Schema events) if "Weekly" schedule provide the day(s) of the week "Monday" ... "Sunday"
   */
  daysOfWeek?: TDaysOfWeek[];
  /**
   * (Schema events) if "Monthly" schedule provide the day(s) of the month 1...31
   */
  daysOfMonth?: TDaysOfMonth[];
  /**
   * (Schema events) Use different timezone. Default is "UTC"
   */
  timeZone?: TTimeZones;
  /**
   * (Schema events) use daylight saving time. true or false, Default is "true"
   */
  daylightSavingTime?:
    | "ObserveDaylightSavingTime"
    | "PermanentStandardTime"
    | "PermanentDaylightSavingTime";
}

export interface ISchemaEventOperationalCondensed {
  id?: string;
  privileges?: string[];
  timesTriggered?: number;
  nextExecution?: string;
}

export interface IExternalProgramTaskOperationalCondensed {
  id?: string;
  privileges?: string[];
  timesTriggered?: number;
  nextExecution?: string;
  lastExecutionResult: ITaskExecutionResult;
}

export interface IExternalProgramTaskCondensed {
  id?: string;
  privileges?: string[];
  name?: string;
  taskType?: number;
  enabled?: boolean;
  taskSessionTimeout?: number;
  maxRetries?: number;
  operational?: IExternalProgramTaskOperationalCondensed;
}

export interface IExternalProgramTask extends IExternalProgramTaskCondensed {
  createdDate: string;
  modifiedDate: string;
  privileges: string[];
  schemaPath: string;
  customProperties: ICustomPropertyCondensed[];
  tags: ITagCondensed[];
  path: string;
  parameters: string;
}

export interface ISchemaEventCondensed {
  id?: string;
  privileges?: string[];
  name: string;
  enabled?: boolean;
  eventType?: number;
  operational: ISchemaEventOperationalCondensed;
}

export interface ISchemaEvent extends ISchemaEventCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  timeZone: string;
  daylightSavingTime: number;
  startDate: string;
  expirationDate: string;
  schemaFilterDescription: string[];
  incrementDescription: string;
  incrementOption: number;
  externalProgramTask: IExternalProgramTaskCondensed;
  reloadTask: IExternalProgramTaskCondensed;
  userSyncTask: IExternalProgramTaskCondensed;
}

export interface ITaskExecutionResult {
  id: string;
  privileges: string[];
  executingNodeName: string;
  status: number;
  startTime: string;
  stopTime: string;
  duration: number;
  fileReferenceID: string;
  scriptLogAvailable: boolean;
  scriptLogLocation: string;
  scriptLogSize: number;
  details: IExecutionResultDetailCondensed[];
}

export interface ITaskOperational {
  privileges: string[];
  lastExecutionResult: ITaskExecutionResult;
  id: string;
  nextExecution: string;
}

export interface ITaskCondensed {
  id?: string;
  name: string;
  taskType: number;
  enabled: boolean;
  maxRetries: number;
  taskSessionTimeout: number;
}

export interface ITask extends ITaskCondensed {
  app: IApp;
  privileges: string[];
  isManuallyTriggered: boolean;
  schemaPath: string;
  operational: ITaskOperational;
  tags: ITagCondensed[];
  createdDate: string;
  modifiedByUserName: string;
  customProperties: ICustomPropertyCondensed[];
  modifiedDate: string;
  isPartialReload: boolean;
  timeToLive: number;
  preloadNodes: string[];
}

export interface IReloadTaskBundle {
  task: ITaskCondensed & {
    app: {
      id: string;
    };
    tags: ITagCondensed[];
    customProperties: ICustomPropertyCondensed[];
  };
  compositeEvents: ICompositeEvent[];
  schemaEvents: ISchemaEventCondensed[];
}

export interface ISelectionEvent {
  id?: string;
  name: string;
  enabled?: boolean;
  eventType?: number;
  privileges?: string[];
  operational?: {
    id?: string;
    nextExecution?: string;
    timesTriggered?: number;
    privileges?: string[];
  };
}

export interface ICompositeEventRuleOperationalCondensed {
  id?: string;
  privileges?: string[];
  timeStamp?: string;
  currentState?: number;
}

export interface ICompositeEventRule {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  ruleState?: number;
  reloadTask?: IExternalProgramTaskCondensed;
  userSyncTask?: IExternalProgramTaskCondensed;
  externalProgramTask?: IExternalProgramTaskCondensed;
  operational?: ICompositeEventRuleOperationalCondensed;
}

export interface ICompositeEvent {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  name?: string;
  enabled?: boolean;
  eventType?: number;
  userSyncTask?: null;
  externalProgramTask?: null;
  privileges: string[];
  schemaPath: string;
  timeConstraint: {
    id?: string;
    createdDate?: string;
    modifiedDate?: string;
    modifiedByUserName?: string;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    schemaPath?: string;
  };
  operational: {
    id?: string;
    timesTriggered?: number;
    privileges?: string[];
  };
  reloadTask?: IExternalProgramTaskCondensed;
  compositeRules?: ICompositeEventRule[];
}

// export interface IReloadTaskChange {
//   schemaPath?: string;
//   task?: string;
//   compositeEventsToDelete?: string[];
//   schemaEventsToDelete?: string[];
// }

export type ITableColumnType =
  | "Undefined"
  | "Property"
  | "Function"
  | "List"
  | "Privileges"
  | string;

export interface ITableColumnBase {
  columnType: ITableColumnType;
  definition: string;
  name?: string;
}

export interface ITableColumn {
  columnType: ITableColumnType;
  definition: string;
  name?: string;
  list?: ITableColumnBase[];
}

export interface ITableCreate {
  type: string;
  columns: ITableColumn[];
  filter?: string;
  skip?: number;
  take?: number;
  sortColumn?: string;
  orderAscending?: boolean;
}

export interface ITable<T> {
  id: string;
  columnNames: string[];
  rows: T[];
  schemaPath: string;
}

export interface ITableRaw {
  id: string;
  columnNames: string[];
  rows: [][];
  schemaPath: string;
}

export interface ISchedulerServiceUpdate {
  schedulerServiceType?: TSchedulerServiceType;
  maxConcurrentEngines?: number;
  engineTimeout?: number;
  tags?: string[];
  customProperties?: string[];
}

export interface ISchedulerServiceCondensed {
  id?: string;
  privileges?: string[];
}

export interface ISchedulerServiceSettingsLogVerbosity
  extends IProxyServiceSettingsLogVerbosity {
  logVerbosityApplication?: number;
  logVerbosityTaskExecution?: number;
}

export interface ISchedulerServiceSettings {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  schedulerServiceType?: number;
  maxConcurrentEngines?: number;
  engineTimeout?: number;
  logVerbosity?: ISchedulerServiceSettingsLogVerbosity;
}

export interface ISchedulerService extends ISchedulerServiceCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  customProperties?: ICustomPropertyCondensed[];
  tags?: ITagCondensed[];
  serverNodeConfiguration: IServerNodeConfigurationCondensed;
  settings: ISchedulerServiceSettings;
}

export interface IServiceClusterCondensed {
  id?: string;
  privileges?: string[];
  name: string;
}

export interface IServiceCluster extends IServiceClusterCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  settings: IServiceClusterSettings;
}

export interface IServiceClusterSettingsDbCredentials {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  userName?: string;
  password?: string;
}

export interface IServiceClusterSettingsEncryption {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  enableEncryptQvf?: boolean;
  enableEncryptQvd?: boolean;
  encryptionKeyThumbprint?: string;
}

export interface IServiceClusterSettingsSharedPersistenceProperties {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  rootFolder?: string;
  appFolder?: string;
  staticContentRootFolder?: string;
  connector32RootFolder?: string;
  connector64RootFolder?: string;
  archivedLogsRootFolder?: string;
  databaseHost?: string;
  databasePort?: number;
  sSLPort?: number;
  failoverTimeout?: number;
}

export interface IServiceClusterSettings {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  persistenceMode: number;
  dataCollection?: boolean;
  tasksImpersonation?: boolean;
  databaseCredentials: IServiceClusterSettingsDbCredentials;
  encryption: IServiceClusterSettingsEncryption;
  sharedPersistenceProperties: IServiceClusterSettingsSharedPersistenceProperties;
}

export interface IServiceClusterUpdate {
  name?: string;
  persistenceMode?: number;
  rootFolder?: string;
  appFolder?: string;
  staticContentRootFolder?: string;
  connector32RootFolder?: string;
  connector64RootFolder?: string;
  archivedLogsRootFolder?: string;
  failoverTimeout?: number;
  enableEncryptQvf?: boolean;
  enableEncryptQvd?: boolean;
  encryptionKeyThumbprint?: string;
}

export interface IServiceStatusCondensed {
  id?: string;
  privileges?: string[];
}

export interface IServiceStatus extends IServiceStatusCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  serviceType: number;
  serviceState: number;
  timestamp?: string;
  serverNodeConfiguration: IServerNodeConfigurationCondensed;
}

export interface ISharedContentUpdate {
  tags?: string[];
  customProperties?: string[];
  owner?: string;
  name?: string;
  type?: string;
  description?: string;
}

export interface ISharedContentMetaData {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  key?: string;
  value?: string;
}

export interface ISharedContentCreate {
  tags?: string[];
  customProperties?: string[];
  name?: string;
  type?: string;
  description?: string;
}

export interface ISharedContentCondensed {
  id?: string;
  privileges?: string[];
  name: string;
  type: string;
  description?: string;
  uri?: string;
  metaData?: ISharedContentMetaData[];
}

export interface ISharedContent extends ISharedContentCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  customProperties?: ICustomPropertyCondensed[];
  tags?: ITagCondensed[];
  owner: IOwner;
  whiteList: IFileExtensionWhiteListCondensed;
  references?: IStaticContentReferenceCondensed[];
}

export type NotificationChangeType = "Add" | "Update" | "Delete";
export type NotificationObjectType =
  | "App"
  | "AnalyticConnection"
  | "ContentLibrary"
  | "DataConnection"
  | "Extension"
  | "ReloadTask"
  | "Stream"
  | "User"
  | "UserSyncTask"
  | "SystemRule"
  | "Tag"
  | "CustomPropertyDefinition"
  | "EngineService"
  | "OdagService"
  | "PrintingService"
  | "ProxyService"
  | "RepositoryService"
  | "SchedulerService"
  | "ServerNodeConfiguration"
  | "VirtualProxyConfig";
// | string;

export interface INotificationCreate {
  name: NotificationObjectType;
  uri: string;
  id?: string;
  filter?: string;
  condition?: string;
  changetype?: NotificationChangeType;
  propretyname?: string;
}

export interface ChangesSinceOutputCondensed {
  id?: string;
  type?: string;
  changeDate?: string;
  changeType?: NotificationChangeType;
  object?: {
    [k: string]: any;
  };
}

export type TAddRemoveSet = "add" | "remove" | "set";

export interface IExecutionResultDetailCondensed {
  id: string;
  detailsType: number;
  message: string;
  detailCreatedDate: string;
  privileges: string[];
}

export interface IExecutionResultDetail
  extends IExecutionResultDetailCondensed {
  createdDate: string;
  modifiedByUserName: string;
  schemaPath: string;
  modifiedDate: string;
}

export interface IExecutionResult {
  id: string;
  createdDate: string;
  modifiedDate: string;
  modifiedByUserName: string;
  taskID: string;
  executionID: string;
  appID: string;
  executingNodeID: string;
  executingNodeName: string;
  status: number;
  startTime: string;
  stopTime: string;
  duration: number;
  fileReferenceID: string;
  scriptLogAvailable: boolean;
  details: ExecutionResultDetail[];
  scriptLogLocation: string;
  scriptLogSize: number;
  privileges: string[];
  schemaPath: string;
}

export interface IExecutionResultDetailCreate {
  /**
   * 0:Error
   *
   * 1: Warning
   *
   * 2: Information
   */
  detailsType?: 0 | 1 | 2;
  message?: string;
  detailCreatedDate?: string;
}

export interface IExecutionResultCreate {
  taskID?: string;
  appID?: string;
  executingNodeID?: string;
  executingNodeName?: string;
  /**
   * 0: NeverStarted
   *
   * 1: Triggered
   *
   * 2: Started
   *
   * 3: Queued
   *
   * 4: AbortInitiated
   *
   * 5: Aborting
   *
   * 6: Aborted
   *
   * 7: FinishedSuccess
   *
   * 8: FinishedFail
   *
   * 9: Skipped
   *
   * 10: Retry
   *
   * 11: Error
   *
   * 12: Reset
   *
   * 13: DistributionQueue
   *
   * 14: DistributionRunning
   */
  status?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
  startTime?: string;
  stopTime?: string;
  duration?: number;
  scriptLogAvailable?: boolean;
  scriptLogLocation?: string;
  scriptLogSize?: number;
  details?: IExecutionResultDetailCreate[];
}

export interface IExecutingNode {
  id: string;
  privileges: string[];
}

export interface IExecutionSession {
  id: string;
  executingNode: IExecutingNode;
  executionResult: IExecutionResult;
  abortAt: string;
  /**
   * 0: Undefined
   *
   * 1: Manual
   *
   * 2: Timeout
   *
   * 3: DeletedTask
   */
  abortReason: number;
  reloadTask: IExternalProgramTaskCondensed;
  userSyncTask: IExternalProgramTaskCondensed;
  externalProgramTask: IExternalProgramTaskCondensed;
  privileges: string[];
}

export interface ICustomBannerMessage {
  id?: string;
  createdDate: string;
  modifiedDate: string;
  modifiedByUserName?: string;
  schemaPath: string;
  privileges: string[];
  name: string;
  message: string;
  /**
   * 0: Standard
   *
   * 1: Info
   *
   * 2: Warning
   *
   * 3: Error
   */
  messageType: 0 | 1 | 2 | 3;
  isActive: boolean;
  /**
   * duration in seconds
   */
  duration: number;
  tags: ITagCondensed[];
}

export interface ICustomBannerCreate {
  name: string;
  message: string;
  /**
   * 0: Standard
   *
   * 1: Info
   *
   * 2: Warning
   *
   * 3: Error
   */
  messageType: 0 | 1 | 2 | 3;
  isActive: boolean;
  /**
   * duration in seconds
   */
  duration: number;
}

export interface IODAGService {
  id: string;
  privileges: string[];
  createdDate: string;
  modifiedByUserName: string;
  schemaPath: string;
  modifiedDate: string;
  settings: {
    dynamicViewEnabled: boolean;
    schemaPath: string;
    anonymousAppCleanup: number;
    anonymousProxyUser: {
      privileges: string[];
      userDirectory: string;
      userDirectoryConnectorName: string;
      name: string;
      id: string;
      userId: string;
    };
    maxConcurrentRequests: number;
    enabled: boolean;
    createdDate: string;
    modifiedByUserName: string;
    logLevel: number;
    modifiedDate: string;
    allowAnonymousUser: boolean;
    id: string;
    purgeOlderThan: number;
  };
}

export interface IODAGServiceUpdate {
  enabled?: boolean;
  dynamicViewEnabled?: boolean;
  /**
   * 0: Off
   * 1: Fatal
   * 2: Error
   * 3: Warning
   * 4: Info
   * 5: Debug
   * 6: Trace
   */
  logLevel?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  maxConcurrentRequests?: number;
  purgeOlderThan?: number;
  allowAnonymousUser?: boolean;
  anonymousAppCleanup?: number;
  anonymousProxyUser?: {
    userId: string;
    userDirectory: string;
    userDirectoryConnectorName?: string;
    name?: string;
  };
}

/**
 * 0: NotApplicable
 * 1: Available
 * 2: NoActiveRoute
 * 3: NoConfiguredRoute
 * 4: NotSynced
 * 5: NotMigrated
 */
export type IOdagRequestAvailabilityStatus = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * 0: single
 * 1: multiple
 * 2: singlesub
 */
export type IOdagRequestKind = 0 | 1 | 2;

/**
 * 0: validating
 * 1: queued
 * 2: invalid
 * 3: hold
 * 4: loading
 * 5: canceled
 * 6: failed
 * 7: succeeded
 * 8 : canceling
 * 9: canceledAck
 * 10: failedAck
 */
export type IOdagRequestState = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * 0: active
 * 1: disabled
 * 2: decommissioned
 * 3: incomplete
 */
export type IOdagRequestLinkStatus = 0 | 1 | 2 | 3;

/**
 * 0: pending
 * 1: success
 * 2: warnings
 * 3: failed
 */
export type IOdagRequestLoadStatus = 0 | 1 | 2 | 3;

export interface IOdagRequestCondensed {
  privileges: string[];
  selectionAppId: string;
  generatedApp: {
    privileges: string[];
    publishTime: string;
    migrationHash: string;
    stream: {
      privileges: string[];
      name: string;
      id: string;
    };
    appId: string;
    name: string;
    savedInProductVersion: string;
    id: string;
    published: boolean;
    availabilityStatus: {};
  };
  createdByAnonymousUser: string;
  link: {
    owner: {
      privileges: string[];
      userDirectory: string;
      userDirectoryConnectorName: string;
      name: string;
      id: string;
      userId: string;
    };
    privileges: string[];
    isView: boolean;
    name: string;
    templateAppOrigName: string;
    rowEstExpr: string;
    id: string;
    templateApp: {
      privileges: string[];
      publishTime: string;
      migrationHash: string;
      stream: {
        privileges: string[];
        name: string;
        id: string;
      };
      appId: string;
      name: string;
      savedInProductVersion: string;
      id: string;
      published: boolean;
      availabilityStatus: {};
    };
    odagLinkStatus: IOdagRequestLinkStatus;
  };
  startedAt: string;
  odagRequestLoadStatus: IOdagRequestLoadStatus;
  selectionStateHash: number;
  bindingStateHash: number;
  finishedAt: string;
  selectionAppOrigName: string;
  parentRequestId: string;
  timeToLive: number;
  engine: string;
  sheetname: string;
  id: string;
  odagRequestState: IOdagRequestState;
  purgeAfter: string;
  clientContextHandle: string;
  targetSheet: string;
  odagRequestKind: IOdagRequestKind;
}

/**
 * 0: active
 * 1: disabled
 * 2: decommissioned
 */
export type IOdagRequestEngineStatus = 0 | 1 | 2;

export interface IOdagRequest {
  privileges: string[];
  generatedAppOrigName: string;
  createdByAnonymousUser: string;
  link: {
    owner: {
      privileges: string[];
      userDirectory: string;
      userDirectoryConnectorName: string;
      name: string;
      id: string;
      userId: string;
    };
    privileges: string[];
    isView: boolean;
    name: string;
    templateAppOrigName: string;
    rowEstExpr: string;
    id: string;
    templateApp: {
      privileges: string[];
      publishTime: string;
      migrationHash: string;
      stream: {
        privileges: string[];
        name: string;
        id: string;
      };
      appId: string;
      name: string;
      savedInProductVersion: string;
      id: string;
      published: boolean;
      availabilityStatus: IOdagRequestAvailabilityStatus;
    };
    odagLinkStatus: IOdagRequestLinkStatus;
  };
  startedAt: string;
  engineGroup: {
    owner: {
      userDirectory: string;
      userDirectoryConnectorName: string;
      name: string;
      id: string;
      userId: string;
    };
    privileges: string[];
    name: string;
    id: string;
    odagEngineGroupStatus: IOdagRequestEngineStatus;
  };
  selectionAppOrigName: string;
  parentRequestId: string;
  timeToLive: number;
  modifiedByUserName: string;
  engine: string;
  sheetname: string;
  id: string;
  odagRequestState: IOdagRequestState;
  purgeAfter: string;
  targetSheet: string;
  odagRequestKind: IOdagRequestKind;
  owner: {
    userDirectory: string;
    userDirectoryConnectorName: string;
    name: string;
    id: string;
    userId: string;
  };
  curRowEstExpr: string;
  bindingState: string;
  curRowEstLowBound: number;
  selectionAppId: string;
  generatedApp: {
    privileges: string[];
    publishTime: string;
    migrationHash: string;
    stream: {
      privileges: string[];
      name: string;
      id: string;
    };
    appId: string;
    name: string;
    savedInProductVersion: string;
    id: string;
    published: boolean;
    availabilityStatus: IOdagRequestAvailabilityStatus;
  };
  schemaPath: string;
  odagRequestLoadStatus: IOdagRequestLoadStatus;
  selectionStateHash: number;
  bindingStateHash: number;
  finishedAt: string;
  selectionState: string;
  createdDate: string;
  modifiedDate: string;
  actualRowEst: number;
  messages: string;
  curRowEstHighBound: number;
  clientContextHandle: string;
}

export interface ILoadBalancingResult {
  schemaPath: string;
  appID: string;
  validEngines: string[];
  /**
   * 0: Ok
   * 1: AppNotFound
   * 2: ProxyNotFound
   * 3: ProxyPrefixNotFound
   * 4: AppNotEnabled
   */
  loadBalancingResultCode: number;
}

export interface ILoadBalancingResultExtended {
  schemaPath: string;
  appID: string;
  validEngines: {}[];
  /**
   * 0: Ok
   * 1: AppNotFound
   * 2: ProxyNotFound
   * 3: ProxyPrefixNotFound
   * 4: AppNotEnabled
   */
  loadBalancingResultCode: number;
}

export interface ILoadBalancingNodeResult {
  schemaPath: string;
  appID: string;
  hosts: string[];
  /**
   * 0: Ok
   * 1: AppNotFound
   * 2: ProxyNotFound
   * 3: ProxyPrefixNotFound
   * 4: AppNotEnabled
   */
  loadBalancingResultCode: number;
}

export interface ILoadBalancingRequest {
  schemaPath?: string;
  proxyID?: string;
  proxyPrefix?: string;
  appID: string;
  /**
   * 0: Production
   * 1: Development
   * 2: Any
   */
  loadBalancingPurpose: number;
}
