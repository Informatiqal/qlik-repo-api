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
  modifiedByUserName: string;
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
  modifiedByUserName: string;
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
  modifiedByUserName: string;
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
  modifiedByUserName: string;
  schemaPath: string;
  modifiedDate: string;
  description: string;
  objectTypes: TCustomPropObjectTypes[];
}

export interface ICustomPropertyObject {
  createdDate: string;
  modifiedByUserName: string;
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
  modifiedByUserName: string;
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
  modifiedByUserName: string;
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
  modifiedByUserName: string;
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
  modifiedByUserName: string;
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
  modifiedByUserName?: string;
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

export interface ITaskExecutionResultDetails {
  privileges: string[];
  detailsType: number;
  id: string;
  message: string;
  detailCreatedDate: string;
}

export interface ITaskExecutionResult {
  duration: number;
  privileges: string[];
  executingNodeName: string;
  scriptLogLocation: string;
  fileReferenceID: string;
  startTime: string;
  stopTime: string;
  scriptLogAvailable: boolean;
  details: ITaskExecutionResultDetails[];
  id: string;
  status: {};
  scriptLogSize: number;
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
  modifiedByUserName: string;
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
  modifiedByUserName: string;
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
  id: string;
  name: string;
  hostName: string;
  temporaryfilepath: string;
  privileges: string[];
  serviceCluster: {
    id: string;
    name: string;
    privileges: string[];
    roles: {
      id: string;
      definition: number;
      privileges: string[];
    }[];
  };
}

export interface IEngine {
  id: string;
  createdDate: string;
  modifiedDate: string;
  modifiedByUserName: string;
  customProperties: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  tags: ITagCondensed[];
  privileges: string[];
  schemaPath: string;
  settings: IEngineSettings;
  serverNodeConfiguration: IServerNodeConfiguration;
}
