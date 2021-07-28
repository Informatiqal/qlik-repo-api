import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import { About, IClassAbout } from "./About";
import { App, IClassApp } from "./App";
import { AppObject, IClassAppObject } from "./AppObject";
import { Certificate, IClassCertificate } from "./Certificate";
import { ContentLibrary, IClassContentLibrary } from "./ContentLibrary";
import { CustomProperty, IClassCustomProperty } from "./CustomProperty";
import { DataConnection, IClassDataConnection } from "./DataConnection";
import { Engine, IClassEngine } from "./Engine";
import { Extension, IClassExtension } from "./Extension";
import { License, IClassLicense } from "./License";
import { Node, IClassNode } from "./Node";
import { Privileges, IClassPrivileges } from "./Privileges";
import { Proxy, IClassProxy } from "./Proxy";
import { Scheduler, IClassScheduler } from "./Scheduler";
import { ServiceCluster, IClassServiceCluster } from "./ServiceCluster";
import { ServiceStatus, IClassServiceStatus } from "./ServiceStatus";
import { SharedContent, IClassSharedContent } from "./SharedContent";
import { Stream, IClassStream } from "./Stream";
import { SystemRule, IClassSystemRule } from "./SystemRule";
import { Table, IClassTable } from "./Table";
import { Tag, IClassTag } from "./Tag";
import { Task, IClassTask } from "./Task";
import { User, IClassUser } from "./User";
import { UserDirectory, IClassUserDirectory } from "./UserDirectory";

export * from "./types/interfaces";
export * from "./types/ranges";
export * from "./About";
export * from "./App";
export * from "./AppObject";
export * from "./Certificate";
export * from "./ContentLibrary";
export * from "./CustomProperty";
export * from "./DataConnection";
export * from "./Engine";
export * from "./Extension";
export * from "./License";
export * from "./License.interface";
export * from "./Node";
export * from "./Privileges";
export * from "./Proxy";
export * from "./Proxy.interface";
export * from "./Scheduler";
export * from "./ServiceCluster";
export * from "./ServiceCluster.interface";
export * from "./ServiceStatus";
export * from "./SharedContent";
export * from "./SystemRule";
export * from "./SystemRule.interface";
export * from "./Stream";
export * from "./Table";
export * from "./Tag";
export * from "./Task";
export * from "./Task.interface";
export * from "./User";
export * from "./UserDirectory";
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
  public dataConnection: IClassDataConnection;
  public engine: IClassEngine;
  public extension: IClassExtension;
  public license: IClassLicense;
  public privileges: IClassPrivileges;
  public proxy: IClassProxy;
  public node: IClassNode;
  public schedulerService: IClassScheduler;
  public serviceCluster: IClassServiceCluster;
  public serviceStatus: IClassServiceStatus;
  public sharedContent: IClassSharedContent;
  public stream: IClassStream;
  public systemRule: IClassSystemRule;
  public table: IClassTable;
  public tag: IClassTag;
  public task: IClassTask;
  public user: IClassUser;
  public userDirectory: IClassUserDirectory;
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
    this.contentLibrary = new ContentLibrary(
      this.repoClient,
      this.genericClient
    );
    this.customProperty = new CustomProperty(this.repoClient);
    this.dataConnection = new DataConnection(this.repoClient);
    this.engine = new Engine(this.repoClient);
    this.extension = new Extension(this.repoClient);
    this.license = new License(this.repoClient);
    this.node = new Node(this.repoClient);
    this.privileges = new Privileges(this.repoClient);
    this.proxy = new Proxy(this.repoClient, this.node);
    this.schedulerService = new Scheduler(this.repoClient);
    this.serviceCluster = new ServiceCluster(this.repoClient);
    this.serviceStatus = new ServiceStatus(this.repoClient);
    this.sharedContent = new SharedContent(this.repoClient);
    this.stream = new Stream(this.repoClient);
    this.systemRule = new SystemRule(this.repoClient);
    this.table = new Table(this.repoClient);
    this.tag = new Tag(this.repoClient);
    this.task = new Task(this.repoClient);
    this.user = new User(this.repoClient);
    this.userDirectory = new UserDirectory(this.repoClient);
  }
}
