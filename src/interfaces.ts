import { ITag, ITagCondensed } from "./Tag";
import { IApp } from "./App";
import { IAppObject } from "./AppObject";
import { IContentLibrary } from "./ContentLibrary";
import { ICustomPropertyCondensed, ICustomProperty } from "./CustomProperty";
import { IExtension } from "./Extension";
import { IUser, IUserCondensed } from "./User";

export type IHttpStatus = number;

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

export interface IOwner {
  privileges: [];
  userDirectory: string;
  userDirectoryConnectorName: string;
  name: string;
  id: string;
  userId: string;
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
  customProperties: ICustomPropertyObject[];
  owner: IOwner;
  tags: ITagCondensed[];
}

export interface ICustomPropertyObject {
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

export interface IAppExportResponse {
  exportToken: string;
  downloadPath: string;
  schemaPath: string;
  appId: string;
  cancelled: boolean;
}

export type TSystemRuleActions =
  | "None"
  | "Create"
  | "Read"
  | "Update"
  | "Delete"
  | "Export"
  | "Publish"
  | "Change owner"
  | "Change role"
  | "Export data"
  | "Offline access"
  | "Distribute"
  | "Duplicate"
  | "Approve"
  | "Allow access";

export type TSystemRuleCategory = "License" | "Security" | "Sync";
export type TSystemRuleContext = "hub" | "qmc" | "both" | "BothQlikSenseAndQMC";

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

export interface IExecutionResultDetailCondensed {
  privileges: string[];
  detailsType: number;
  id: string;
  message: string;
  detailCreatedDate: string;
}

export interface ITaskExecutionResult {
  id: string;
  privileges: string[];
  executingNodeName: string;
  status: {};
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
  id: string;
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
  customProperties: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  modifiedDate: string;
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

export interface IServerNodeConfiguration {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  customProperties?: ICustomPropertyCondensed[] | ICustomPropertyObject[];
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

export interface IEngine {
  id: string;
  createdDate: string;
  modifiedDate: string;
  customProperties: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  tags: ITagCondensed[];
  privileges: string[];
  schemaPath: string;
  settings: IEngineSettings;
  serverNodeConfiguration: IServerNodeConfigurationCondensed;
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

export interface IEngineGetValidResult {
  schemaPath?: string;
  loadBalancingResultCode?: number;
  appID?: string;
  validEngines?: string[];
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
  resources?: IAuditResourceCondensed[];
  rules?: IAuditRuleCondensed[];
  ruleApplication?: ISystemRuleApplicationItemCondensed[];
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
  name: string;
  taskType?: number;
  enabled?: boolean;
  taskSessionTimeout: number;
  maxRetries: number;
  operational: IExternalProgramTaskOperationalCondensed;
}

export interface ISchemaEventOperationalCondensed {
  id?: string;
  privileges?: string[];
  timesTriggered?: number;
  nextExecution?: string;
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
  schemaPath?: string;
  timeZone: string;
  startDate: string;
  expirationDate: string;
  schemaFilterDescription: string[];
  incrementalDescription: string;
  incrementalOption: number;
  externalProgramTask: IExternalProgramTaskCondensed;
  reloadTask: IExternalProgramTaskCondensed;
  userSyncTask: IExternalProgramTaskCondensed;
}

export interface IUserDirectorySettings {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  name: string;
  category?: string;
  userDirectorySettingType: number;
  secret: boolean;
  value?: string;
  secretValue?: string;
}

export interface IUserDirectoryCondensed {
  id?: string;
  privileges?: string[];
  name: string;
  type: string;
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
  settings?: IUserDirectorySettings;
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

export interface ILicenseAccessGroup {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  name?: string;
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
  customProperties: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  tags: ITagCondensed[];
  owner: IUserCondensed;
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
  customProperties: ICustomPropertyCondensed[] | ICustomPropertyObject[];
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

export interface IProxyServiceCondensed {
  id?: string;
  privileges: string[];
}

export interface IProxyService extends IProxyServiceCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  customProperties?: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  tags?: ITagCondensed[];
  serverNodeConfiguration: IServerNodeConfiguration;
  settings: IProxyServiceSettings;
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
  logVerbosity;
  SchedulerServiceSettingsLogVerbosity;
}

export interface ISchedulerServiceCondensed {
  id?: string;
  privileges?: string[];
}

export interface ISchedulerService extends ISchedulerServiceCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  customProperties?: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  tags?: ITagCondensed[];
  serverNodeConfiguration: IServerNodeConfigurationCondensed;
  settings: ISchedulerServiceSettings;
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
  customProperties?: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  tags?: ITagCondensed[];
  owner: IOwner;
  whiteList: IFileExtensionWhiteListCondensed;
  references?: IStaticContentReferenceCondensed[];
}
