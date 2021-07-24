import internal from "stream";
import {
  TCustomPropObjectTypes,
  TSystemRuleCategory,
  TSystemRuleActions,
  TSystemRuleContext,
} from "../interfaces";

import {
  TRangeOf5,
  TRangeOf100,
  TRangeOf256,
  TTimeZones,
  TDaysOfMonth,
  TDaysOfWeek,
  TRepeatOptions,
} from "./ranges";

export interface IUserUpdate {
  id: string;
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

export interface ICustomPropertyCreate {
  name: string;
  description?: string;
  choiceValues?: string[];
  objectTypes?: TCustomPropObjectTypes[];
  valueType?: string;
}

export interface ICustomPropertyUpdate extends ICustomPropertyCreate {
  id: string;
}

export interface IAppUpdate {
  id: string;
  name?: string;
  description?: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
  stream?: string;
}

export interface IStreamCreate {
  name: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IStreamUpdate {
  id: string;
  name?: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IContentLibraryUpdate {
  id: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IExtensionUpdate {
  id: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IExtensionImport {
  file: Buffer;
  password?: string;
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
  type: "Analyzer" | "Professional";
  rule: string;
  comment?: string;
  disabled?: boolean;
  tags?: string[];
  customProperties?: string[];
}

export interface ISystemRuleUpdate {
  id: string;
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

export interface ITaskCreate {
  name: string;
  appId: string;
  tags?: string[];
  customProperties?: string[];
}

export interface ITaskReloadUpdate {
  id: string;
  name?: string;
  enabled?: boolean;
  taskSessionTimeout?: number;
  maxRetries?: number;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface ITaskCreateTriggerComposite {
  taskId: string;
  triggerName: string;
  eventTaskId: string;
  state: "success" | "fail";
}

export interface ITaskCreateTriggerSchema {
  reloadTaskId: string;
  name: string;
  repeat?: TRepeatOptions;
  repeatEvery?: number;
  startDate?: string;
  expirationDate?: string;
  daysOfWeek?: TDaysOfWeek;
  daysOfMonth?: TDaysOfMonth;
  timeZone?: TTimeZones;
  daylightSavingTime?: boolean;
}

interface ITableColumnBase {
  columnType: string;
  definition: string;
  name?: string;
}

export interface ITableColumn {
  columnType: string;
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

export interface IEngineUpdate {
  id: string;
  workingSetSizeMode?: "IgnoreMaxLimit" | "SoftMaxLimit" | "HardMaxLimit";
  workingSetSizeLoPct?: TRangeOf100;
  workingSetSizeHiPct?: TRangeOf100;
  cpuThrottlePercentage?: TRangeOf100;
  coresToAllocate?: TRangeOf256;
  allowDataLineage?: boolean;
  standardReload?: boolean;
  documentDirectory?: string;
  documentTimeout?: number;
  autosaveInterval?: number;
  genericUndoBufferMaxSize?: number;
  auditActivityLogVerbosity?: TRangeOf5;
  auditSecurityLogVerbosity?: TRangeOf5;
  systemLogVerbosity?: TRangeOf5;
  externalServicesLogVerbosity?: TRangeOf5;
  qixPerformanceLogVerbosity?: TRangeOf5;
  serviceLogVerbosity?: TRangeOf5;
  httpTrafficLogVerbosity?: TRangeOf5;
  auditLogVerbosity?: TRangeOf5;
  trafficLogVerbosity?: TRangeOf5;
  sessionLogVerbosity?: TRangeOf5;
  performanceLogVerbosity?: TRangeOf5;
  sseLogVerbosity?: TRangeOf5;
}

export interface IEngineGetValid {
  proxyID?: string;
  proxyPrefix?: string;
  appId?: string;
  loadBalancingPurpose?: "Production" | "Development" | "Any";
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

export interface ISystemRuleLicenseCreate {}

export interface IServiceClusterUpdate {
  id: string;
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

export interface IUserDirectoryUpdate {
  id: string;
  name: string;
  path: string;
  userName: string;
  password: string;
  ldapFilter: string;
  timeout: string;
  pageSize: string;
  tags?: string[];
  customProperties?: string[];
}

export interface INodeUpdate {
  id: string;
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
}

export interface INodeCreate {
  hostName: string;
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

interface ILicense {
  name: string;
  organization?: string;
}

export interface ILicenseSetSerial extends ILicense {
  serial: string;
  control: string;
  lef: string;
}

export interface ILicenseSetKey extends ILicense {
  key: string;
}

export interface IDataConnectionCreate {
  name: string;
  connectionString: string;
  owner: string;
  type?: string;
  username?: string;
  password?: string;
  architecture?: "x86" | "x64" | "Undefined";
  logOn?: "Current user" | "Service user";
  tags?: string[];
  customProperties?: string[];
}

export interface IDataConnectionUpdate {
  id: string;
  connectionString?: string;
  username?: string;
  password?: string;
  owner?: string;
  tags?: string[];
  customProperties?: string[];
}