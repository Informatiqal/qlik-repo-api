import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import { About } from "./About";
import { App } from "./App";
import { AppObject } from "./AppObject";
import { ContentLibrary } from "./ContentLibrary";
import { CustomProperty } from "./CustomProperty";
import { DataConnection } from "./DataConnection";
import { Extension } from "./Extension";
import { Engine } from "./Engine";
import { License } from "./License";
import { Node } from "./Node";
import { Stream } from "./Stream";
import { SystemRule } from "./SystemRule";
import { ServiceCluster } from "./ServiceCluster";
import { ServiceStatus } from "./ServiceStatus";
import { Table } from "./Table";
import { Tag } from "./Tag";
import { Task } from "./Task";
import { User } from "./User";
import { UserDirectory } from "./UserDirectory";

import {
  IAbout,
  IAccessTypeInfo,
  IApp,
  IAppObject,
  IAppObjectCondensed,
  IAudit,
  IRemoveFilter,
  IContentLibrary,
  ICustomProperty,
  IDataConnection,
  IDataConnectionCondensed,
  IEngine,
  IServerNodeConfiguration,
  IExtension,
  ISystemRule,
  IHttpReturn,
  IHttpReturnRemove,
  ILicense,
  ILicenseAccessGroup,
  ILicenseAccessTypeCondensed,
  IServiceCluster,
  IServiceStatus,
  IStream,
  ITag,
  ITask,
  ITaskExecutionResult,
  IUser,
  IUserDirectory,
} from "./interfaces";
export {
  IAbout,
  IAccessTypeInfo,
  IApp,
  IAppObject,
  IAppObjectCondensed,
  IAudit,
  IRemoveFilter,
  IContentLibrary,
  ICustomProperty,
  IDataConnection,
  IDataConnectionCondensed,
  IEngine,
  IServerNodeConfiguration,
  IExtension,
  ISystemRule,
  IHttpReturn,
  IHttpReturnRemove,
  ILicense,
  ILicenseAccessTypeCondensed,
  ILicenseAccessGroup,
  IServiceCluster,
  IServiceStatus,
  IStream,
  ITag,
  ITask,
  ITaskExecutionResult,
  IUser,
  IUserDirectory,
};

import {
  IAppObjectUpdate,
  IDataConnectionCreate,
  IDataConnectionUpdate,
  IAuditParameters,
  IExtensionUpdate,
  IUserUpdate,
  IUserCreate,
  IStreamUpdate,
  ITaskCreateTriggerSchema,
  ITaskCreateTriggerComposite,
  ITaskCreate,
  ITableCreate,
  IServiceClusterUpdate,
  IStreamCreate,
  ISystemRuleUpdate,
  ISystemRuleCreate,
  IExtensionImport,
  IEngineUpdate,
  ICustomPropertyUpdate,
  ICustomPropertyCreate,
  IContentLibraryUpdate,
  IAppUpdate,
  INodeUpdate,
  INodeCreate,
  ILicenseSetKey,
  ILicenseSetSerial,
} from "./interfaces/argument.interface";
export {
  IAppObjectUpdate,
  IDataConnectionCreate,
  IDataConnectionUpdate,
  IAuditParameters,
  IExtensionUpdate,
  IUserUpdate,
  IUserCreate,
  IStreamUpdate,
  ITaskCreateTriggerSchema,
  ITaskCreateTriggerComposite,
  ITaskCreate,
  ITableCreate,
  IServiceClusterUpdate,
  IStreamCreate,
  ISystemRuleUpdate,
  ISystemRuleCreate,
  IExtensionImport,
  IEngineUpdate,
  ICustomPropertyUpdate,
  ICustomPropertyCreate,
  IContentLibraryUpdate,
  IAppUpdate,
  INodeUpdate,
  INodeCreate,
  ILicenseSetKey,
  ILicenseSetSerial,
};

export class QlikRepoApi {
  public repoClient: QlikRepositoryClient;
  public genericClient: QlikGenericRestClient;
  public genericRepoClient: QlikRepositoryClient;
  public genericWESClient: QlikRepositoryClient;
  constructor(public repoConfig: any) {
    this.repoClient = new QlikRepositoryClient(repoConfig);

    const genericConfig = { ...repoConfig };
    delete genericConfig.port;
    this.genericClient = new QlikGenericRestClient(genericConfig);

    const genericRepoConfig = { ...repoConfig };
    delete genericRepoConfig.port;
    this.genericRepoClient = new QlikGenericRestClient(genericConfig);
  }

  aboutGet = About.prototype.aboutGet;
  aboutEnums = About.prototype.aboutEnums;
  aboutOpenApi = About.prototype.aboutOpenApi;
  aboutApiRelations = About.prototype.aboutApiRelations;
  aboutApiDescription = About.prototype.aboutApiDescription;
  aboutApiDefaults = About.prototype.aboutApiDefaults;

  appGet = App.prototype.appGet;
  appGetFilter = App.prototype.appGetFilter;
  appUpload = App.prototype.appUpload;
  appUploadReplace = App.prototype.appUploadReplace;
  appRemove = App.prototype.appRemove;
  appRemoveFilter = App.prototype.appRemoveFilter;
  appCopy = App.prototype.appCopy;
  appExport = App.prototype.appExport;
  appPublish = App.prototype.appPublish;
  appSelect = App.prototype.appSelect;
  appSwitch = App.prototype.appSwitch;
  appUpdate = App.prototype.appUpdate;

  appObjectGet = AppObject.prototype.appObjectGet;
  appObjectGetFilter = AppObject.prototype.appObjectGetFilter;
  appObjectPublish = AppObject.prototype.appObjectPublish;
  appObjectUnPublish = AppObject.prototype.appObjectUnPublish;
  appObjectRemove = AppObject.prototype.appObjectRemove;
  appObjectUpdate = AppObject.prototype.appObjectUpdate;

  contentLibraryGet = ContentLibrary.prototype.contentLibraryGet;
  contentLibraryGetFilter = ContentLibrary.prototype.contentLibraryGetFilter;
  contentLibraryCreate = ContentLibrary.prototype.contentLibraryCreate;
  contentLibraryExport = ContentLibrary.prototype.contentLibraryExport;
  contentLibraryImport = ContentLibrary.prototype.contentLibraryImport;
  contentLibraryImportForApp =
    ContentLibrary.prototype.contentLibraryImportForApp;
  contentLibraryRemove = ContentLibrary.prototype.contentLibraryRemove;
  contentLibraryRemoveFilter =
    ContentLibrary.prototype.contentLibraryRemoveFilter;
  contentLibrarySelect = ContentLibrary.prototype.contentLibrarySelect;
  contentLibraryUpdate = ContentLibrary.prototype.contentLibraryUpdate;

  customPropertyGet = CustomProperty.prototype.customPropertyGet;
  customPropertyGetFilter = CustomProperty.prototype.customPropertyGetFilter;
  customPropertyCreate = CustomProperty.prototype.customPropertyCreate;
  customPropertyRemove = CustomProperty.prototype.customPropertyRemove;
  customPropertySelect = CustomProperty.prototype.customPropertySelect;
  customPropertyUpdate = CustomProperty.prototype.customPropertyUpdate;

  dataConnectionCreate = DataConnection.prototype.dataConnectionCreate;
  dataConnectionGet = DataConnection.prototype.dataConnectionGet;
  dataConnectionGetFilter = DataConnection.prototype.dataConnectionGetFilter;
  dataConnectionRemove = DataConnection.prototype.dataConnectionRemove;
  dataConnectionUpdate = DataConnection.prototype.dataConnectionUpdate;

  extensionGet = Extension.prototype.extensionGet;
  extensionGetFilter = Extension.prototype.extensionGetFilter;
  extensionRemove = Extension.prototype.extensionRemove;
  extensionUpdate = Extension.prototype.extensionUpdate;
  extensionImport = Extension.prototype.extensionImport;

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
  nodeGetFilter = Node.prototype.nodeGetFilter;
  nodeRemove = Node.prototype.nodeRemove;
  nodeRemoveFilter = Node.prototype.nodeRemoveFilter;
  nodeUpdate = Node.prototype.nodeUpdate;
  nodeCreate = Node.prototype.nodeCreate;
  nodeRegister = Node.prototype.nodeRegister;

  serviceClusterCount = ServiceCluster.prototype.serviceClusterCount;
  serviceClusterGet = ServiceCluster.prototype.serviceClusterGet;
  serviceClusterGetFilter = ServiceCluster.prototype.serviceClusterGetFilter;
  serviceClusterRemove = ServiceCluster.prototype.serviceClusterRemove;
  serviceClusterSetCentral = ServiceCluster.prototype.serviceClusterSetCentral;
  serviceClusterUpdate = ServiceCluster.prototype.serviceClusterUpdate;

  serviceStatusCount = ServiceStatus.prototype.serviceStatusCount;
  serviceStatusGet = ServiceStatus.prototype.serviceStatusGet;
  serviceStatusGetFilter = ServiceStatus.prototype.serviceStatusGetFilter;

  streamGet = Stream.prototype.streamGet;
  streamGetFilter = Stream.prototype.streamGetFilter;
  streamCreate = Stream.prototype.streamCreate;
  streamRemove = Stream.prototype.streamRemove;
  streamUpdate = Stream.prototype.streamUpdate;

  ruleGet = SystemRule.prototype.ruleGet;
  ruleGetAudit = SystemRule.prototype.ruleGetAudit;
  ruleGetFilter = SystemRule.prototype.ruleGetFilter;
  ruleCreate = SystemRule.prototype.ruleCreate;
  ruleRemove = SystemRule.prototype.ruleRemove;
  ruleLicenseCreate = SystemRule.prototype.ruleLicenseCreate;
  ruleUpdate = SystemRule.prototype.ruleUpdate;

  tagGet = Tag.prototype.tagGet;
  tagGetAll = Tag.prototype.tagGetAll;
  tagGetFilter = Tag.prototype.tagGetFilter;
  tagCreate = Tag.prototype.tagCreate;
  tagRemove = Tag.prototype.tagRemove;
  tagRemoveFilter = Tag.prototype.tagRemoveFilter;
  tagUpdate = Tag.prototype.tagUpdate;

  tableCreate = Table.prototype.tableCreate;

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
  taskTriggerCreateComposite = Task.prototype.taskTriggerCreateComposite;
  taskTriggerCreateSchema = Task.prototype.taskTriggerCreateSchema;

  userGet = User.prototype.userGet;
  userGetFilter = User.prototype.userGetFilter;
  userCreate = User.prototype.userCreate;
  userRemove = User.prototype.userRemove;
  userUpdate = User.prototype.userUpdate;

  userDirectoryCount = UserDirectory.prototype.userDirectoryCount;
  userDirectoryGet = UserDirectory.prototype.userDirectoryGet;
  userDirectoryGetFilter = UserDirectory.prototype.userDirectoryGetFilter;
  userDirectoryRemove = UserDirectory.prototype.userDirectoryRemove;
  userDirectoryRemoveFilter = UserDirectory.prototype.userDirectoryRemoveFilter;
}
