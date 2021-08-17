import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { ISelection } from "./types/interfaces";
import { ITagCondensed } from "./Tags";
import { ICustomPropertyCondensed } from "./CustomProperties";
import { IServerNodeConfigurationCondensed } from "./Nodes";

import { IEngineGetValid } from "./Engine.interface";
import { Engine, IClassEngine } from "./Engine";

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

export interface IClassEngines {
  get(id: string): Promise<IClassEngine>;
  getAll(): Promise<IClassEngine[]>;
  getFilter(filter: string): Promise<IClassEngine[]>;
  getValid(arg?: IEngineGetValid): Promise<IEngineGetValidResult[]>;
  select(filter?: string): Promise<ISelection>;
}

export class Engines implements IClassEngines {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`engines.get: "id" parameter is required`);
    const engine: Engine = new Engine(this.repoClient, id);
    await engine.init();

    return engine;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`engineservice/full`)
      .then((res) => res.data as IEngine[])
      .then((data) => {
        return data.map((t) => new Engine(this.repoClient, t.id, t));
      });
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
    if (!filter) throw new Error(`engine.getFilter: "filter" is required`);

    let baseUrl = `engineservice/full`;

    return await this.repoClient
      .Get(`${baseUrl}?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IEngine[])
      .then((data) => {
        return data.map((t) => new Engine(this.repoClient, t.id, t));
      });
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/engineservice`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
