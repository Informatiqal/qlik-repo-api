import { QlikRepositoryClient } from "qlik-rest-api";
import { IEngineUpdate, IEngine } from "./types/interfaces";
import { modifiedDateTime } from "./util/generic";

export interface IClassEngine {
  update(arg: IEngineUpdate): Promise<IEngine>;
  details: IEngine;
}

export class Engine implements IClassEngine {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IEngine;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: IEngine) {
    if (!id) throw new Error(`engine.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get(`engineservice/${this.#id}`)
        .then((res) => res.data as IEngine);
    }
  }

  public async update(arg: IEngineUpdate) {
    if (arg.workingSetSizeLoPct) {
      if (arg.workingSetSizeLoPct < 0 || arg.workingSetSizeLoPct > 100)
        throw new Error(
          "engine.update: workingSetSizeLoPct must be between 0 and 100"
        );
      this.details.settings.workingSetSizeLoPct = arg.workingSetSizeLoPct;
    }

    if (arg.listenerPorts)
      this.details.settings.listenerPorts = arg.listenerPorts;

    if (arg.qrsHttpNotificationPort)
      this.details.settings.qrsHttpNotificationPort =
        arg.qrsHttpNotificationPort;

    if (arg.hyperCubeMemoryLimit)
      this.details.settings.hyperCubeMemoryLimit = arg.hyperCubeMemoryLimit;

    if (arg.reloadMemoryLimit)
      this.details.settings.reloadMemoryLimit = arg.reloadMemoryLimit;
    if (arg.reloadTimeLimitSec)
      this.details.settings.reloadTimeLimitSec = arg.reloadTimeLimitSec;

    if (arg.exportMemoryLimit)
      this.details.settings.exportMemoryLimit = arg.exportMemoryLimit;
    if (arg.exportTimeLimitSec)
      this.details.settings.exportTimeLimitSec = arg.exportTimeLimitSec;

    if (arg.objectTimeLimitSec)
      this.details.settings.objectTimeLimitSec = arg.objectTimeLimitSec;

    if (arg.createSearchIndexOnReloadEnabled)
      this.details.settings.createSearchIndexOnReloadEnabled =
        arg.createSearchIndexOnReloadEnabled;

    if (arg.globalLogMinuteInterval)
      this.details.settings.globalLogMinuteInterval =
        arg.globalLogMinuteInterval;

    if (arg.workingSetSizeHiPct) {
      if (arg.workingSetSizeHiPct < 0 || arg.workingSetSizeHiPct > 100)
        throw new Error(
          "engine.update: workingSetSizeHiPct must be between 0 and 100"
        );
      this.details.settings.workingSetSizeHiPct = arg.workingSetSizeHiPct;
    }

    if (arg.cpuThrottlePercentage) {
      if (arg.cpuThrottlePercentage < 0 || arg.cpuThrottlePercentage > 100)
        throw new Error(
          "engine.update: cpuThrottlePercentage must be between 0 and 100"
        );
      this.details.settings.cpuThrottlePercentage = arg.cpuThrottlePercentage;
    }

    if (arg.workingSetSizeMode) {
      if (
        arg.workingSetSizeMode != "IgnoreMaxLimit" &&
        arg.workingSetSizeMode != "SoftMaxLimit" &&
        arg.workingSetSizeMode != "HardMaxLimit"
      )
        throw new Error(
          `engine.update: Engine config working set valid values are: IgnoreMaxLimit, SoftMaxLimit, HardMaxLimit`
        );

      if (arg.workingSetSizeMode == "IgnoreMaxLimit")
        this.details.settings.workingSetSizeMode == 0;

      if (arg.workingSetSizeMode == "SoftMaxLimit")
        this.details.settings.workingSetSizeMode == 1;

      if (arg.workingSetSizeMode == "HardMaxLimit")
        this.details.settings.workingSetSizeMode == 2;
    }

    if (arg.coresToAllocate) {
      if (arg.coresToAllocate < 0 || arg.coresToAllocate > 256)
        throw new Error(
          "engine.update: coresToAllocate must be between 0 and 256"
        );

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

      this.details.settings.maxCoreMaskPersisted = maxCoreMaskPersisted;
      this.details.settings.maxCoreMaskHiPersisted = maxCoreMaskHiPersisted;
      this.details.settings.maxCoreMaskGrp1Persisted = maxCoreMaskGrp1Persisted;
      this.details.settings.maxCoreMaskGrp1HiPersisted =
        maxCoreMaskGrp1HiPersisted;
      this.details.settings.maxCoreMaskGrp2Persisted = maxCoreMaskGrp2Persisted;
      this.details.settings.maxCoreMaskGrp2HiPersisted =
        maxCoreMaskGrp2HiPersisted;
      this.details.settings.maxCoreMaskGrp3Persisted = maxCoreMaskGrp3Persisted;
      this.details.settings.maxCoreMaskGrp3HiPersisted =
        maxCoreMaskGrp3HiPersisted;
    }

    if (arg.documentDirectory)
      this.details.settings.documentDirectory = arg.documentDirectory;

    if (arg.allowDataLineage)
      this.details.settings.allowDataLineage = arg.allowDataLineage;

    if (arg.standardReload)
      this.details.settings.standardReload = arg.standardReload;

    if (arg.documentTimeout)
      this.details.settings.documentTimeout = arg.documentTimeout;

    if (arg.autosaveInterval)
      this.details.settings.autosaveInterval = arg.autosaveInterval;

    if (arg.genericUndoBufferMaxSize)
      this.details.settings.genericUndoBufferMaxSize =
        arg.genericUndoBufferMaxSize;

    if (arg.auditActivityLogVerbosity) {
      if (
        arg.auditActivityLogVerbosity < 0 ||
        arg.auditActivityLogVerbosity > 5
      )
        throw new Error(
          "engine.update: auditActivityLogVerbosity must be between 0 and 5"
        );
      this.details.settings.auditActivityLogVerbosity =
        arg.auditActivityLogVerbosity;
    }

    if (arg.auditSecurityLogVerbosity) {
      if (
        arg.auditSecurityLogVerbosity < 0 ||
        arg.auditSecurityLogVerbosity > 5
      )
        throw new Error(
          "engine.update: auditSecurityLogVerbosity must be between 0 and 5"
        );
      this.details.settings.auditSecurityLogVerbosity =
        arg.auditSecurityLogVerbosity;
    }

    if (arg.systemLogVerbosity) {
      if (arg.systemLogVerbosity < 0 || arg.systemLogVerbosity > 5)
        throw new Error(
          "engine.update: systemLogVerbosity must be between 0 and 5"
        );
      this.details.settings.systemLogVerbosity = arg.systemLogVerbosity;
    }

    if (arg.externalServicesLogVerbosity) {
      if (
        arg.externalServicesLogVerbosity < 0 ||
        arg.externalServicesLogVerbosity > 5
      )
        throw new Error(
          "engine.update: externalServicesLogVerbosity must be between 0 and 5"
        );
      this.details.settings.externalServicesLogVerbosity =
        arg.externalServicesLogVerbosity;
    }

    if (arg.qixPerformanceLogVerbosity) {
      if (
        arg.qixPerformanceLogVerbosity < 0 ||
        arg.qixPerformanceLogVerbosity > 5
      )
        throw new Error(
          "engine.update: qixPerformanceLogVerbosity must be between 0 and 5"
        );
      this.details.settings.qixPerformanceLogVerbosity =
        arg.qixPerformanceLogVerbosity;
    }

    if (arg.serviceLogVerbosity) {
      if (arg.serviceLogVerbosity < 0 || arg.serviceLogVerbosity > 5)
        throw new Error(
          "engine.update: serviceLogVerbosity must be between 0 and 5"
        );
      this.details.settings.serviceLogVerbosity = arg.serviceLogVerbosity;
    }

    if (arg.httpTrafficLogVerbosity) {
      if (arg.httpTrafficLogVerbosity < 0 || arg.httpTrafficLogVerbosity > 5)
        throw new Error(
          "engine.update: httpTrafficLogVerbosity must be between 0 and 5"
        );
      this.details.settings.httpTrafficLogVerbosity =
        arg.httpTrafficLogVerbosity;
    }

    if (arg.auditLogVerbosity) {
      if (arg.auditLogVerbosity < 0 || arg.auditLogVerbosity > 5)
        throw new Error(
          "engine.update: auditLogVerbosity must be between 0 and 5"
        );
      this.details.settings.auditLogVerbosity = arg.auditLogVerbosity;
    }

    if (arg.trafficLogVerbosity) {
      if (arg.trafficLogVerbosity < 0 || arg.trafficLogVerbosity > 5)
        throw new Error(
          "engine.update: trafficLogVerbosity must be between 0 and 5"
        );
      this.details.settings.trafficLogVerbosity = arg.trafficLogVerbosity;
    }

    if (arg.sessionLogVerbosity) {
      if (arg.sessionLogVerbosity < 0 || arg.sessionLogVerbosity > 5)
        throw new Error(
          "engine.update: sessionLogVerbosity must be between 0 and 5"
        );
      this.details.settings.sessionLogVerbosity = arg.sessionLogVerbosity;
    }

    if (arg.performanceLogVerbosity) {
      if (arg.performanceLogVerbosity < 0 || arg.performanceLogVerbosity > 5)
        throw new Error(
          "engine.update: performanceLogVerbosity must be between 0 and 5"
        );
      this.details.settings.performanceLogVerbosity =
        arg.performanceLogVerbosity;
    }

    if (arg.sseLogVerbosity) {
      if (arg.sseLogVerbosity < 0 || arg.sseLogVerbosity > 5)
        throw new Error(
          "engine.update: auditActivityLogVerbosity must be between 0 and 5"
        );
      this.details.settings.sseLogVerbosity = arg.sseLogVerbosity;
    }

    this.details.modifiedDate = modifiedDateTime();

    return await this.#repoClient
      .Put(`engineservice/${this.details.id}`, { ...this.details })
      .then((res) => res.data as IEngine);
  }
}
