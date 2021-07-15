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
  modifiedByUserName?: string;
}

export interface IUserCreate {
  userId: string;
  userDirectory: string;
  name?: string;
  roles?: string[];
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
  modifiedByUserName?: string;
}

export interface IAppUpdate {
  id: string;
  name?: string;
  description?: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
  stream?: string;
  modifiedByUserName?: string;
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
  modifiedByUserName?: string;
}

export interface IContentLibraryUpdate {
  id: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
  modifiedByUserName?: string;
}

export interface IExtensionUpdate {
  id: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
  modifiedByUserName?: string;
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
  modifiedByUserName?: string;
}

export interface ITaskCreate {
  name: string;
  appId: string;
  tags?: string[];
  customProperties?: string[];
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

interface ITableColumn {
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
  modifiedByUserName?: string;
}
