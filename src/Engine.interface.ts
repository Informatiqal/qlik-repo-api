import { TRangeOf5, TRangeOf100, TRangeOf256 } from "./types/ranges";

export type TEngineWorkingSetSizeMode =
  | "IgnoreMaxLimit"
  | "SoftMaxLimit"
  | "HardMaxLimit";

export type TEngineLoadBalancingPurpose = "Production" | "Development" | "Any";

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
