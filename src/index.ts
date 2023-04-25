import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import { IConfig } from "qlik-rest-api/dist/interfaces/interfaces";
import { About } from "./About";
import { Apps } from "./Apps";
import { AppObjects } from "./AppObjects";
import { Certificate } from "./Certificate";
import { ContentLibraries } from "./ContentLibraries";
import { CustomProperties } from "./CustomProperties";
import { DataConnections } from "./DataConnections";
import { Engines } from "./Engines";
import { Extensions } from "./Extensions";
import { ExecutionResults } from "./ExecutionResults";
import { ExecutionSessions } from "./ExecutionSessions";
import { License } from "./License";
import { Nodes } from "./Nodes";
import { Privileges } from "./Privileges";
import { Proxies } from "./Proxies";
import { Schedulers } from "./Schedulers";
import { ServiceClusters } from "./ServiceClusters";
import { ServiceStatus } from "./ServiceStatus";
import { Selections } from "./Selections";
import { SharedContents } from "./SharedContents";
import { Streams } from "./Streams";
import { SystemRules } from "./SystemRules";
import { Table } from "./Table";
import { Tags } from "./Tags";
import { Tasks } from "./Tasks";
import { ReloadTasks } from "./ReloadTasks";
import { ExternalTasks } from "./ExternalTasks";
import { Users } from "./Users";
import { Notification } from "./Notification";
import { VirtualProxies } from "./VirtualProxies";
import { UserDirectories } from "./UserDirectories";

export namespace QlikRepoApi {
  export class client {
    /**
     * Instance of the underlying HTTP client bound to the repository config
     */
    public repoClient: QlikRepositoryClient;
    /**
     * Instance of the underlying HTTP repo client but not bound to specific repository config
     *
     * Add /qrs in front of the required path
     */
    public genericRepoClient: QlikRepositoryClient;
    /**
     * Instance of the underlying HTTP client that is not bound to the repository config
     */
    public genericClient: QlikGenericRestClient;
    /**
     * Instance of the underlying HTTP client that is not bound to the repository config but where port can be specified
     */
    public genericClientWithPort: QlikGenericRestClient;
    /**
     * HTTP client bound to "wes" endpoints. For example /api/wes/v1/extensions/export
     */
    public genericWESClient: QlikRepositoryClient;

    /**
     * /qrs/about endpoints
     */
    public about: About;
    /**
     * /qrs/app endpoints
     */
    public apps: Apps;
    /**
     * /qrs/app/object endpoints
     */
    public appObjects: AppObjects;
    /**
     * /qrs/CertificateDistribution endpoints
     */
    public certificate: Certificate;
    /**
     * /qrs/contentLibrary endpoints
     */
    public contentLibraries: ContentLibraries;
    /**
     * /qrs/customPropertyDefinition endpoints
     */
    public customProperties: CustomProperties;
    /**
     * /qrs/dataConnection endpoints
     */
    public dataConnections: DataConnections;
    /**
     * /qrs/engineService endpoints
     */
    public engines: Engines;
    /**
     * /qrs/extension endpoints
     */
    public extensions: Extensions;
    /**
     * /qrs/executionresult endpoints
     */
    public executionResults: ExecutionResults;
    /**
     * /qrs/executionsession endpoints
     */
    public executionSessions: ExecutionSessions;    
    /**
     * /qrs/license endpoints
     */
    public license: License;
    /**
     * Audit privileges for an object
     */
    public privileges: Privileges;
    /**
     * /qrs/proxyService endpoints
     */
    public proxies: Proxies;
    /**
     * /qrs/nodes endpoints
     */
    public nodes: Nodes;
    /**
     * /qrs/notification endpoints
     */
    public notification: Notification;
    /**
     * /qrs/schedulerService endpoints
     */
    public schedulerServices: Schedulers;
    /**
     * /qrs/serviceCluster endpoints
     */
    public serviceClusters: ServiceClusters;
    /**
     * /qrs/serviceStatus endpoints
     */
    public serviceStatus: ServiceStatus;
    /**
     * /qrs/selection endpoints
     */
    public selections: Selections;
    /**
     * /qrs/sharedContent endpoints
     */
    public sharedContents: SharedContents;
    /**
     * /qrs/stream endpoints
     */
    public streams: Streams;
    /**
     * /qrs/systemRule endpoints
     * Note: this endpoints are service security, license and load balancing rules
     */
    public systemRules: SystemRules;
    /**
     * /qrs/table endpoints
     */
    public table: Table;
    /**
     * /qrs/tag endpoints
     */
    public tags: Tags;
    /**
     * /qrs/task endpoints
     */
    public tasks: Tasks;
    /**
     * /qrs/reloadTask endpoints
     */
    public reloadTasks: ReloadTasks;
    /**
     * /qrs/externalProgramTask endpoints
     */
    public externalTasks: ExternalTasks;
    /**
     * /qrs/user endpoints
     */
    public users: Users;
    /**
     * /qrs/userDirectory endpoints
     */
    public userDirectories: UserDirectories;
    /**
     * /qrs/virtualProxy endpoints
     */
    public virtualProxies: VirtualProxies;
    constructor(public repoConfig: IConfig) {
      this.repoClient = new QlikRepositoryClient(repoConfig);

      const genericConfig = { ...repoConfig };
      delete genericConfig.port;
      this.genericClient = new QlikGenericRestClient(genericConfig);
      this.genericClientWithPort = new QlikGenericRestClient(genericConfig);

      // TODO: what is my purpose?
      let t = this.genericClientWithPort.configFull.baseUrl.split("/");
      t[2] = `${t[2]}:${this.repoClient.configFull.port}`;
      this.genericClientWithPort.configFull.baseUrl = t.join("/");

      // const repoConfigPort = repoConfig.port;
      const genericRepoConfig = { ...repoConfig };
      // delete genericRepoConfig.port;
      this.genericRepoClient = new QlikGenericRestClient({
        ...genericConfig,
        // port: repoConfigPort,
      });
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
      this.executionResults = new ExecutionResults(this.repoClient);
      this.executionSessions = new ExecutionSessions(this.repoClient);
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
      this.notification = new Notification(this.repoClient);
    }
  }
}
