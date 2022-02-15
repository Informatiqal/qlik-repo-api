import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import { About, IClassAbout } from "./About";
import { Apps, IClassApps } from "./Apps";
import { AppObjects, IClassAppObjects } from "./AppObjects";
import { Certificate, IClassCertificate } from "./Certificate";
import { ContentLibraries, IClassContentLibraries } from "./ContentLibraries";
import { CustomProperties, IClassCustomProperties } from "./CustomProperties";
import { DataConnections, IClassDataConnections } from "./DataConnections";
import { Engines, IClassEngines } from "./Engines";
import { Extensions, IClassExtensions } from "./Extensions";
import { License, IClassLicense } from "./License";
import { Nodes, IClassNodes } from "./Nodes";
import { Privileges, IClassPrivileges } from "./Privileges";
import { Proxies, IClassProxies } from "./Proxies";
import { Schedulers, IClassSchedulers } from "./Schedulers";
import { ServiceClusters, IClassServiceClusters } from "./ServiceClusters";
import { ServiceStatus, IClassServiceStatus } from "./ServiceStatus";
import { Selections, IClassSelections } from "./Selections";
import { SharedContents, IClassSharedContents } from "./SharedContents";
import { Streams, IClassStreams } from "./Streams";
import { SystemRules, IClassSystemRules } from "./SystemRules";
import { Table, IClassTable } from "./Table";
import { Tags, IClassTags } from "./Tags";
import { Tasks, IClassTasks } from "./Tasks";
import { ReloadTasks, IClassReloadTasks } from "./ReloadTasks";
import { ExternalTasks, IClassExternalTasks } from "./ExternalTasks";
// import { TaskTriggers, IClassTaskTriggers } from "./TaskTriggers";
import { Users, IClassUsers } from "./Users";
import { VirtualProxies, IClassVirtualProxies } from "./VirtualProxies";
import { UserDirectories, IClassUserDirectories } from "./UserDirectories";

export namespace QlikRepoApi {
  export class client {
    public repoClient: QlikRepositoryClient;
    public genericClient: QlikGenericRestClient;
    public genericClientWithPort: QlikGenericRestClient;
    public genericRepoClient: QlikRepositoryClient;
    public genericWESClient: QlikRepositoryClient;

    public about: IClassAbout;
    public apps: IClassApps;
    public appObjects: IClassAppObjects;
    public certificate: IClassCertificate;
    public contentLibraries: IClassContentLibraries;
    public customProperties: IClassCustomProperties;
    public dataConnections: IClassDataConnections;
    public engines: IClassEngines;
    public extensions: IClassExtensions;
    public license: IClassLicense;
    public privileges: IClassPrivileges;
    public proxies: IClassProxies;
    public nodes: IClassNodes;
    public schedulerServices: IClassSchedulers;
    public serviceClusters: IClassServiceClusters;
    public serviceStatus: IClassServiceStatus;
    public selections: IClassSelections;
    public sharedContents: IClassSharedContents;
    public streams: IClassStreams;
    public systemRules: IClassSystemRules;
    public table: IClassTable;
    public tags: IClassTags;
    public tasks: IClassTasks;
    public reloadTasks: IClassReloadTasks;
    public externalTasks: IClassExternalTasks;
    // public taskTriggers: IClassExternalTasks;
    public users: IClassUsers;
    public userDirectories: IClassUserDirectories;
    public virtualProxies: IClassVirtualProxies;
    constructor(public repoConfig: any) {
      this.repoClient = new QlikRepositoryClient(repoConfig);

      const genericConfig = { ...repoConfig };
      delete genericConfig.port;
      this.genericClient = new QlikGenericRestClient(genericConfig);
      this.genericClientWithPort = new QlikGenericRestClient(genericConfig);

      let t = this.genericClientWithPort.configFull.baseUrl.split("/");
      t[2] = `${t[2]}:${this.repoClient.configFull.port}`;
      this.genericClientWithPort.configFull.baseUrl = t.join("/");

      const genericRepoConfig = { ...repoConfig };
      delete genericRepoConfig.port;
      this.genericRepoClient = new QlikGenericRestClient(genericConfig);
      this.about = new About(this.repoClient);
      this.apps = new Apps(
        this.repoClient,
        this.genericClient,
        this.genericClientWithPort
      );
      this.appObjects = new AppObjects(this.repoClient);
      this.certificate = new Certificate(this.repoClient);
      this.contentLibraries = new ContentLibraries(
        this.repoClient,
        this.genericClient
      );
      this.customProperties = new CustomProperties(this.repoClient);
      this.dataConnections = new DataConnections(this.repoClient);
      this.engines = new Engines(this.repoClient);
      this.extensions = new Extensions(this.repoClient);
      this.license = new License(this.repoClient);
      this.nodes = new Nodes(this.repoClient, this.genericClient);
      this.privileges = new Privileges(this.repoClient);
      this.proxies = new Proxies(this.repoClient, this.nodes);
      this.schedulerServices = new Schedulers(this.repoClient);
      this.serviceClusters = new ServiceClusters(this.repoClient);
      this.serviceStatus = new ServiceStatus(this.repoClient);
      this.selections = new Selections(this.repoClient);
      this.sharedContents = new SharedContents(this.repoClient);
      this.streams = new Streams(this.repoClient);
      this.systemRules = new SystemRules(this.repoClient);
      this.table = new Table(this.repoClient);
      this.tags = new Tags(this.repoClient);
      this.tasks = new Tasks(this.repoClient);
      this.reloadTasks = new ReloadTasks(this.repoClient);
      this.externalTasks = new ExternalTasks(this.repoClient);
      this.users = new Users(this.repoClient);
      this.userDirectories = new UserDirectories(this.repoClient);
      this.virtualProxies = new VirtualProxies(this.repoClient);
    }
  }
}
