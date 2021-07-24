import { QlikRepoApi } from "./main";

import { modifiedDateTime } from "./util/generic";
import { IEngine, IEngineCondensed, IEngineGetValidResult } from "./interfaces";
import {
  IEngineUpdate,
  IEngineGetValid,
} from "./interfaces/argument.interface";

export class Engine {
  constructor() {}

  public async engineGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IEngine[] | IEngineCondensed[]> {
    let url = "engineservice";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res) => {
      if (!id) return res.data as IEngineCondensed[];

      return [res.data] as IEngine[];
    });
  }

  public async engineGetAll(this: QlikRepoApi): Promise<IEngine[]> {
    return await this.repoClient
      .Get(`engineservice/full`)
      .then((res) => res.data as IEngine[]);
  }

  public async engineGetValid(
    this: QlikRepoApi,
    arg?: IEngineGetValid
  ): Promise<IEngineGetValidResult[]> {
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

  public async engineGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IEngine[]> {
    if (!filter) throw new Error(`engineGetFilter: "filter" is required`);

    let baseUrl = `engineservice/full`;

    return await this.repoClient
      .Get(`${baseUrl}?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IEngine[]);
  }

  // REVIEW: double check the whole logic here
  public async engineUpdate(
    this: QlikRepoApi,
    arg: IEngineUpdate
  ): Promise<IEngine> {
    if (!arg.id) throw new Error(`engineUpdate: "id" is required`);

    let engine = await this.engineGet(arg.id).then((e) => e[0] as IEngine);

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
