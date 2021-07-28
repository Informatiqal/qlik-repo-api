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
  id: string;
  workingSetSizeMode?: TEngineWorkingSetSizeMode;
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
