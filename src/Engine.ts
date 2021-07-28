import { QlikRepositoryClient } from "./main";
import { modifiedDateTime } from "./util/generic";

import { ITagCondensed } from "./Tag";
import { ICustomPropertyCondensed } from "./CustomProperty";
import { IServerNodeConfigurationCondensed } from "./Node";

import { IEngineGetValid, IEngineUpdate } from "./Engine.interface";

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

export interface IClassEngine {
  get(id: string): Promise<IEngine>;
  getAll(): Promise<IEngineCondensed[]>;
  getFilter(filter: string): Promise<IEngine[]>;
  getValid(arg?: IEngineGetValid): Promise<IEngineGetValidResult[]>;
  update(arg: IEngineUpdate): Promise<IEngine>;
}

export class Engine implements IClassEngine {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`engineGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`engineservice`)
      .then((res) => res.data as IEngine);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`engineservice`)
      .then((res) => res.data as IEngineCondensed[]);
  }

  public async getValid(arg?: IEngineGetValid) {
    let loadBalancingPurpose = 2;
    if (arg && arg.loadBalancingPurpose == "Production")
      loadBalancingPurpose = 0;
    if (arg && arg.loadBalancingPurpose == "Development")
      loadBalancingPurpose = 1;
    if (arg && arg.loadBalancingPurpose == "Any") loadBalancingPurpose = 2;

    const body = {
      proxyId: arg.proxyID || "",
      proxyPrefix: arg.proxyPrefix || "",
      appId: arg.appId || "",
      loadBalancingPurpose: loadBalancingPurpose,
    };

    return await this.repoClient
      .Post(`loadbalancing/validengines"`, body)
      .then((res) => res.data as IEngineGetValidResult[]);
  }

  public async getFilter(filter: string) {
    if (!filter) throw new Error(`engineGetFilter: "filter" is required`);

    let baseUrl = `engineservice/full`;

    return await this.repoClient
      .Get(`${baseUrl}?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IEngine[]);
  }

  // REVIEW: double check the whole logic here
  public async update(arg: IEngineUpdate) {
    if (!arg.id) throw new Error(`engineUpdate: "id" is required`);

    let engine = await this.get(arg.id);

    if (arg.workingSetSizeLoPct) {
      if (arg.workingSetSizeLoPct < 0 || arg.workingSetSizeLoPct > 100)
        throw new Error("workingSetSizeLoPct must be between 0 and 100");
      engine.settings.workingSetSizeLoPct = arg.workingSetSizeLoPct;
    }

    if (arg.workingSetSizeHiPct) {
      if (arg.workingSetSizeHiPct < 0 || arg.workingSetSizeHiPct > 100)
        throw new Error("workingSetSizeHiPct must be between 0 and 100");
      engine.settings.workingSetSizeHiPct = arg.workingSetSizeHiPct;
    }

    if (arg.cpuThrottlePercentage) {
      if (arg.cpuThrottlePercentage < 0 || arg.cpuThrottlePercentage > 100)
        throw new Error("cpuThrottlePercentage must be between 0 and 100");
      engine.settings.cpuThrottlePercentage = arg.cpuThrottlePercentage;
    }

    if (arg.workingSetSizeMode) {
      if (
        arg.workingSetSizeMode != "IgnoreMaxLimit" &&
        arg.workingSetSizeMode != "SoftMaxLimit" &&
        arg.workingSetSizeMode != "HardMaxLimit"
      )
        throw new Error(
          `Engine config working set valid values are: IgnoreMaxLimit, SoftMaxLimit, HardMaxLimit`
        );

      if (arg.workingSetSizeMode == "IgnoreMaxLimit")
        engine.settings.workingSetSizeMode == 0;

      if (arg.workingSetSizeMode == "SoftMaxLimit")
        engine.settings.workingSetSizeMode == 1;

      if (arg.workingSetSizeMode == "HardMaxLimit")
        engine.settings.workingSetSizeMode == 2;
    }

    if (arg.coresToAllocate) {
      if (arg.coresToAllocate < 0 || arg.coresToAllocate > 256)
        throw new Error("coresToAllocate must be between 0 and 256");

      let mask = [0, 0, 0, 0, 0, 0, 0, 0];
      let bin = "".padEnd(arg.coresToAllocate, "1").padStart(256, "0");

      let [
        maxCoreMaskGrp3HiPersisted,
        maxCoreMaskGrp3Persisted,
        maxCoreMaskGrp2HiPersisted,
        maxCoreMaskGrp2Persisted,
        maxCoreMaskGrp1HiPersisted,
        maxCoreMaskGrp1Persisted,
        maxCoreMaskHiPersisted,
        maxCoreMaskPersisted,
      ] = mask.map((m, i) => parseInt(bin.substr(i * 32 * 32)), 2);

      engine.settings.maxCoreMaskPersisted = maxCoreMaskPersisted;
      engine.settings.maxCoreMaskHiPersisted = maxCoreMaskHiPersisted;
      engine.settings.maxCoreMaskGrp1Persisted = maxCoreMaskGrp1Persisted;
      engine.settings.maxCoreMaskGrp1HiPersisted = maxCoreMaskGrp1HiPersisted;
      engine.settings.maxCoreMaskGrp2Persisted = maxCoreMaskGrp2Persisted;
      engine.settings.maxCoreMaskGrp2HiPersisted = maxCoreMaskGrp2HiPersisted;
      engine.settings.maxCoreMaskGrp3Persisted = maxCoreMaskGrp3Persisted;
      engine.settings.maxCoreMaskGrp3HiPersisted = maxCoreMaskGrp3HiPersisted;
    }

    if (arg.documentDirectory)
      engine.settings.documentDirectory = arg.documentDirectory;

    if (arg.allowDataLineage)
      engine.settings.allowDataLineage = arg.allowDataLineage;

    if (arg.standardReload) engine.settings.standardReload = arg.standardReload;

    if (arg.documentTimeout)
      engine.settings.documentTimeout = arg.documentTimeout;

    if (arg.autosaveInterval)
      engine.settings.autosaveInterval = arg.autosaveInterval;

    if (arg.genericUndoBufferMaxSize)
      engine.settings.genericUndoBufferMaxSize = arg.genericUndoBufferMaxSize;

    if (arg.auditActivityLogVerbosity) {
      if (
        arg.auditActivityLogVerbosity < 0 ||
        arg.auditActivityLogVerbosity > 5
      )
        throw new Error("auditActivityLogVerbosity must be between 0 and 5");
      engine.settings.auditActivityLogVerbosity = arg.auditActivityLogVerbosity;
    }

    if (arg.auditSecurityLogVerbosity) {
      if (
        arg.auditSecurityLogVerbosity < 0 ||
        arg.auditSecurityLogVerbosity > 5
      )
        throw new Error("auditSecurityLogVerbosity must be between 0 and 5");
      engine.settings.auditSecurityLogVerbosity = arg.auditSecurityLogVerbosity;
    }

    if (arg.systemLogVerbosity) {
      if (arg.systemLogVerbosity < 0 || arg.systemLogVerbosity > 5)
        throw new Error("systemLogVerbosity must be between 0 and 5");
      engine.settings.systemLogVerbosity = arg.systemLogVerbosity;
    }

    if (arg.externalServicesLogVerbosity) {
      if (
        arg.externalServicesLogVerbosity < 0 ||
        arg.externalServicesLogVerbosity > 5
      )
        throw new Error("externalServicesLogVerbosity must be between 0 and 5");
      engine.settings.externalServicesLogVerbosity =
        arg.externalServicesLogVerbosity;
    }

    if (arg.qixPerformanceLogVerbosity) {
      if (
        arg.qixPerformanceLogVerbosity < 0 ||
        arg.qixPerformanceLogVerbosity > 5
      )
        throw new Error("qixPerformanceLogVerbosity must be between 0 and 5");
      engine.settings.qixPerformanceLogVerbosity =
        arg.qixPerformanceLogVerbosity;
    }

    if (arg.serviceLogVerbosity) {
      if (arg.serviceLogVerbosity < 0 || arg.serviceLogVerbosity > 5)
        throw new Error("serviceLogVerbosity must be between 0 and 5");
      engine.settings.serviceLogVerbosity = arg.serviceLogVerbosity;
    }

    if (arg.httpTrafficLogVerbosity) {
      if (arg.httpTrafficLogVerbosity < 0 || arg.httpTrafficLogVerbosity > 5)
        throw new Error("httpTrafficLogVerbosity must be between 0 and 5");
      engine.settings.httpTrafficLogVerbosity = arg.httpTrafficLogVerbosity;
    }

    if (arg.auditLogVerbosity) {
      if (arg.auditLogVerbosity < 0 || arg.auditLogVerbosity > 5)
        throw new Error("auditLogVerbosity must be between 0 and 5");
      engine.settings.auditLogVerbosity = arg.auditLogVerbosity;
    }

    if (arg.trafficLogVerbosity) {
      if (arg.trafficLogVerbosity < 0 || arg.trafficLogVerbosity > 5)
        throw new Error("trafficLogVerbosity must be between 0 and 5");
      engine.settings.trafficLogVerbosity = arg.trafficLogVerbosity;
    }

    if (arg.sessionLogVerbosity) {
      if (arg.sessionLogVerbosity < 0 || arg.sessionLogVerbosity > 5)
        throw new Error("sessionLogVerbosity must be between 0 and 5");
      engine.settings.sessionLogVerbosity = arg.sessionLogVerbosity;
    }

    if (arg.performanceLogVerbosity) {
      if (arg.performanceLogVerbosity < 0 || arg.performanceLogVerbosity > 5)
        throw new Error("performanceLogVerbosity must be between 0 and 5");
      engine.settings.performanceLogVerbosity = arg.performanceLogVerbosity;
    }

    if (arg.sseLogVerbosity) {
      if (arg.sseLogVerbosity < 0 || arg.sseLogVerbosity > 5)
        throw new Error("auditActivityLogVerbosity must be between 0 and 5");
      engine.settings.sseLogVerbosity = arg.sseLogVerbosity;
    }

    engine.modifiedDate = modifiedDateTime();

    return await this.repoClient
      .Put(`engineservice/${arg.id}`, { ...engine })
      .then((res) => res.data as IEngine);
  }
}
