import internal from "stream";

export type TCustomPropObjectTypes =
  | "App"
  | "AnalyticConnection"
  | "ContentLibrary"
  | "DataConnection"
  | "EngineService"
  | "Extension"
  | "ServerNodeConfiguration"
  | "PrintingService"
  | "ProxyService"
  | "ReloadTask"
  | "RepositoryService"
  | "SchedulerService"
  | "Stream"
  | "UserSyncTask"
  | "User"
  | "VirtualProxyConfig";

export type IHttpStatus = number;

export interface IHttpReturn {
  status: number;
  statusText: string;
  data: any;
}

export interface IHttpReturnRemove {
  id: string;
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

export interface ITag {
  privileges: [];
  name: string;
  id: string;
}

export interface IStream {
  privileges: [];
  name: string;
  id: string;
}

export interface IApp {
  owner: IOwner;
  privileges: [];
  publishTime: string;
  migrationHash: string;
  thumbnail: string;
  schemaPath: string;
  description: string;
  savedInProductVersion: string;
  sourceAppId: string;
  published: boolean;
  tags: ITagCondensed[];
  lastReloadTime: string;
  createdDate: string;
  customProperties: ICustomPropertyObject[];
  stream: IStream;
  fileSize: number;
  appId: string;
  modifiedDate: string;
  name: string;
  dynamicColor: string;
  id: string;
  availabilityStatus: {};
  targetAppId: string;
}

export interface IStream {
  owner: IOwner;
  privileges: [];
  createdDate: string;
  customProperties: ICustomPropertyObject[];
  schemaPath: string;
  modifiedDate: string;
  name: string;
  id: string;
  tags: ITagCondensed[];
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

export interface IUserAttributes {
  createdDate: string;
  attributeValue: string;
  attributeType: string;
  schemaPath: string;
  modifiedDate: string;
  externalId: string;
  id: string;
}

export interface IUserCondensed {
  privileges: string[];
  userDirectoryConnectorName: string;
  userDirectory: string;
  userId: string;
  name: string;
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
  customProperties: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  inactive: boolean;
  modifiedDate: string;
  attributes: IUserAttributes[];
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
  customProperties: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  owner: IOwner;
  tags: ITagCondensed[];
  whiteList: IFileExtensionWhiteListCondensed;
  references: IStaticContentReferenceCondensed[];
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
  customProperties: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  owner: IOwner;
  tags: ITagCondensed[];
  whiteList: IFileExtensionWhiteListCondensed;
  references: IStaticContentReferenceCondensed[];
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

export interface ISystemRule {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  schemaPath?: string;
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

export interface ITask {
  app: IApp;
  privileges: string[];
  isManuallyTriggered: boolean;
  schemaPath: string;
  operational: ITaskOperational;
  enabled: boolean;
  tags: ITagCondensed[];
  taskType: number;
  maxRetries: number;
  createdDate: string;
  customProperties: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  modifiedDate: string;
  name: string;
  id: string;
  taskSessionTimeout: number;
}

export interface IAbout {
  buildVersion: string;
  requiresBootstrap: boolean;
  schemaPath: string;
  sharedPersistence: boolean;
  singleNodeOnly: boolean;
  buildDate: string;
  databaseProvider: string;
  nodeType: number;
}

export interface IRemoveFilter {
  id: string;
  status: number;
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

export interface IContentLibraryFile {
  name: string;
  file: string;
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

export interface ISchemaEvent {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  schemaPath?: string;
  privileges?: string[];
  name: string;
  enabled?: boolean;
  eventType?: number;
  timeZone: string;
  startDate: string;
  expirationDate: string;
  schemaFilterDescription: string[];
  incrementalDescription: string;
  incrementalOption: number;
  operational: ISchemaEventOperationalCondensed;
  externalProgramTask: IExternalProgramTaskCondensed;
  reloadTask: IExternalProgramTaskCondensed;
  userSyncTask: IExternalProgramTaskCondensed;
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

export interface ServiceClusterSettingsSharedPersistenceProperties {
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

  sharedPersistenceProperties: ServiceClusterSettingsSharedPersistenceProperties;
}

export interface IServiceCluster {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  name: string;
  settings: IServiceClusterSettings;
}

export interface IServiceStatus {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  serviceType: number;
  serviceState: number;
  timestamp?: string;
  serverNodeConfiguration: IServerNodeConfigurationCondensed;
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

export interface IUserDirectory {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  name: string;
  userDirectoryName?: string;
  configured?: boolean;
  operational?: boolean;
  type: string;
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
