import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import { About, IClassAbout } from "./About";
import { App, IClassApp } from "./App";
import { AppObject, IClassAppObject } from "./AppObject";
import { Certificate, IClassCertificate } from "./Certificate";
import { ContentLibrary, IClassContentLibrary } from "./ContentLibrary";
import { CustomProperty, IClassCustomProperty } from "./CustomProperty";
import { Extension, IClassExtension } from "./Extension";
import { ServiceCluster, IClassServiceCluster } from "./ServiceCluster";
import { ServiceStatus, IClassServiceStatus } from "./ServiceStatus";
import { Table, IClassTable } from "./Table";
import { Tag, IClassTag } from "./Tag";
import { User, IClassUser } from "./User";

import { DataConnection } from "./DataConnection";
import { Engine } from "./Engine";
import { License } from "./License";
import { Node } from "./Node";
import { Privileges } from "./Privileges";
import { Proxy } from "./Proxy";
import { SharedContent } from "./SharedContent";
import { Scheduler } from "./Scheduler";
import { Stream } from "./Stream";
import { SystemRule } from "./SystemRule";
import { Task } from "./Task";
import { UserDirectory } from "./UserDirectory";

export * from "./interfaces";
export * from "./interfaces/argument.interface";

export * from "./About";
export * from "./App";
export * from "./AppObject";
export * from "./Certificate";
export * from "./ContentLibrary";
export * from "./CustomProperty";
export * from "./Extension";
export * from "./ServiceCluster";
export * from "./ServiceCluster.interface";
export * from "./ServiceStatus";
export * from "./Table";
export * from "./Tag";
export * from "./User";
export {
  IHttpReturn,
  IConfig,
  IConfigFull,
  QlikGenericRestClient,
  QlikRepositoryClient,
  IHeaderConfig,
  IJWTConfig,
  ISessionConfig,
  ITicketConfig,
  ICertUser,
} from "qlik-rest-api";
export class QlikRepoApi {
  public repoClient: QlikRepositoryClient;
  public genericClient: QlikGenericRestClient;
  public genericRepoClient: QlikRepositoryClient;
  public genericWESClient: QlikRepositoryClient;

  public about: IClassAbout;
  public app: IClassApp;
  public appObject: IClassAppObject;
  public certificate: IClassCertificate;
  public contentLibrary: IClassContentLibrary;
  public customProperty: IClassCustomProperty;
  public extension: IClassExtension;
  public serviceCluster: IClassServiceCluster;
  public serviceStatus: IClassServiceStatus;
  public table: IClassTable;
  public tag: IClassTag;
  public user: IClassUser;
  constructor(public repoConfig: any) {
    this.repoClient = new QlikRepositoryClient(repoConfig);

    const genericConfig = { ...repoConfig };
    delete genericConfig.port;
    this.genericClient = new QlikGenericRestClient(genericConfig);

    const genericRepoConfig = { ...repoConfig };
    delete genericRepoConfig.port;
    this.genericRepoClient = new QlikGenericRestClient(genericConfig);
    this.about = new About(this.repoClient);
    this.app = new App(this.repoClient, this.genericClient);
    this.appObject = new AppObject(this.repoClient);
    this.certificate = new Certificate(this.repoClient);
    this.customProperty = new CustomProperty(this.repoClient);
    this.extension = new Extension(this.repoClient);
    this.serviceStatus = new ServiceStatus(this.repoClient);
    this.serviceCluster = new ServiceCluster(this.repoClient);
    this.table = new Table(this.repoClient);
    this.tag = new Tag(this.repoClient);
    this.user = new User(this.repoClient);
    this.contentLibrary = new ContentLibrary(
      this.repoClient,
      this.genericClient
    );
  }

  dataConnectionCreate = DataConnection.prototype.dataConnectionCreate;
  dataConnectionGet = DataConnection.prototype.dataConnectionGet;
  dataConnectionGetAll = DataConnection.prototype.dataConnectionGetAll;
  dataConnectionGetFilter = DataConnection.prototype.dataConnectionGetFilter;
  dataConnectionRemove = DataConnection.prototype.dataConnectionRemove;
  dataConnectionUpdate = DataConnection.prototype.dataConnectionUpdate;

  engineGet = Engine.prototype.engineGet;
  engineGetAll = Engine.prototype.engineGetAll;
  engineGetFilter = Engine.prototype.engineGetFilter;
  engineGetValid = Engine.prototype.engineGetValid;
  engineUpdate = Engine.prototype.engineUpdate;

  licenseGet = License.prototype.licenseGet;
  licenseAccessTypeInfoGet = License.prototype.licenseAccessTypeInfoGet;
  licenseAnalyzerAccessTypeGet = License.prototype.licenseAnalyzerAccessTypeGet;
  licenseAnalyzerAccessTypeRemove =
    License.prototype.licenseAnalyzerAccessTypeRemove;
  licenseAuditGet = License.prototype.licenseAuditGet;
  licenseLoginAccessTypeGet = License.prototype.licenseLoginAccessTypeGet;
  licenseLoginAccessTypeRemove = License.prototype.licenseLoginAccessTypeRemove;
  licenseProfessionalAccessTypeGet =
    License.prototype.licenseProfessionalAccessTypeGet;
  licenseProfessionalAccessTypeRemove =
    License.prototype.licenseProfessionalAccessTypeRemove;
  licenseUserAccessTypeGet = License.prototype.licenseUserAccessTypeGet;
  licenseUserAccessTypeRemove = License.prototype.licenseUserAccessTypeRemove;
  licenseSetSerial = License.prototype.licenseSetSerial;
  licenseSetKey = License.prototype.licenseSetKey;
  licenseProfessionalAccessGroupCreate =
    License.prototype.licenseProfessionalAccessGroupCreate;
  licenseUserAccessGroupCreate = License.prototype.licenseUserAccessGroupCreate;

  nodeCount = Node.prototype.nodeCount;
  nodeGet = Node.prototype.nodeGet;
  nodeGetAll = Node.prototype.nodeGetAll;
  nodeGetFilter = Node.prototype.nodeGetFilter;
  nodeRemove = Node.prototype.nodeRemove;
  nodeRemoveFilter = Node.prototype.nodeRemoveFilter;
  nodeUpdate = Node.prototype.nodeUpdate;
  nodeCreate = Node.prototype.nodeCreate;
  nodeRegister = Node.prototype.nodeRegister;

  privilegesGet = Privileges.prototype.privilegesGet;
  privilegesAssert = Privileges.prototype.privilegesAssert;

  proxyAdd = Proxy.prototype.proxyAdd;
  proxyCreate = Proxy.prototype.proxyCreate;
  proxyGet = Proxy.prototype.proxyGet;
  proxyGetAll = Proxy.prototype.proxyGetAll;
  proxyGetFilter = Proxy.prototype.proxyGetFilter;
  proxyMetadataExport = Proxy.prototype.proxyMetadataExport;
  proxyUpdate = Proxy.prototype.proxyUpdate;
  virtualProxyGet = Proxy.prototype.virtualProxyGet;
  virtualProxyGetAll = Proxy.prototype.virtualProxyGetAll;
  virtualProxyGetFilter = Proxy.prototype.virtualProxyGetFilter;
  virtualProxyRemove = Proxy.prototype.virtualProxyRemove;
  virtualProxyUpdate = Proxy.prototype.virtualProxyUpdate;

  sharedContentGet = SharedContent.prototype.sharedContentGet;
  sharedContentGetAll = SharedContent.prototype.sharedContentGetAll;
  sharedContentGetFilter = SharedContent.prototype.sharedContentGetFilter;
  sharedContentDeleteFile = SharedContent.prototype.sharedContentDeleteFile;
  sharedContentRemove = SharedContent.prototype.sharedContentRemove;
  sharedContentUpdate = SharedContent.prototype.sharedContentUpdate;
  sharedContentUploadFile = SharedContent.prototype.sharedContentUploadFile;
  sharedContentCreate = SharedContent.prototype.sharedContentCreate;

  schedulerGet = Scheduler.prototype.schedulerGet;
  schedulerGetAll = Scheduler.prototype.schedulerGetAll;
  schedulerGetFilter = Scheduler.prototype.schedulerGetFilter;
  schedulerUpdate = Scheduler.prototype.schedulerUpdate;

  streamGet = Stream.prototype.streamGet;
  streamGetAll = Stream.prototype.streamGetAll;
  streamGetFilter = Stream.prototype.streamGetFilter;
  streamCreate = Stream.prototype.streamCreate;
  streamRemove = Stream.prototype.streamRemove;
  streamUpdate = Stream.prototype.streamUpdate;

  ruleGet = SystemRule.prototype.ruleGet;
  ruleGetAll = SystemRule.prototype.ruleGetAll;
  ruleGetAudit = SystemRule.prototype.ruleGetAudit;
  ruleGetFilter = SystemRule.prototype.ruleGetFilter;
  ruleCreate = SystemRule.prototype.ruleCreate;
  ruleRemove = SystemRule.prototype.ruleRemove;
  ruleLicenseCreate = SystemRule.prototype.ruleLicenseCreate;
  ruleUpdate = SystemRule.prototype.ruleUpdate;

  taskGetAll = Task.prototype.taskGetAll;
  taskReloadGetAll = Task.prototype.taskReloadGetAll;
  taskExternalGetAll = Task.prototype.taskExternalGetAll;
  taskReloadGet = Task.prototype.taskReloadGet;
  taskGetFilter = Task.prototype.taskGetFilter;
  taskReloadCount = Task.prototype.taskReloadCount;
  taskReloadGetFilter = Task.prototype.taskReloadGetFilter;
  taskCreate = Task.prototype.taskCreate;
  taskReloadRemove = Task.prototype.taskReloadRemove;
  taskExternalRemove = Task.prototype.taskExternalRemove;
  taskReloadUpdate = Task.prototype.taskReloadUpdate;
  taskStart = Task.prototype.taskStart;
  taskStartByName = Task.prototype.taskStartByName;
  taskWaitExecution = Task.prototype.taskWaitExecution;
  taskScheduleRemove = Task.prototype.taskScheduleRemove;
  taskScheduleGet = Task.prototype.taskScheduleGet;
  taskScheduleGetAll = Task.prototype.taskScheduleGetAll;
  taskTriggerCreateComposite = Task.prototype.taskTriggerCreateComposite;
  taskTriggerCreateSchema = Task.prototype.taskTriggerCreateSchema;

  userDirectoryCount = UserDirectory.prototype.userDirectoryCount;
  userDirectoryGet = UserDirectory.prototype.userDirectoryGet;
  userDirectoryGetAll = UserDirectory.prototype.userDirectoryGetAll;
  userDirectoryGetFilter = UserDirectory.prototype.userDirectoryGetFilter;
  userDirectoryRemove = UserDirectory.prototype.userDirectoryRemove;
  userDirectoryRemoveFilter = UserDirectory.prototype.userDirectoryRemoveFilter;
}
