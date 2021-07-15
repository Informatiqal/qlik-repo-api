import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import { About } from "./About";
import { App } from "./App";
import { ContentLibrary } from "./ContentLibrary";
import { CustomProperty } from "./CustomProperty";
import { Extension } from "./Extension";
import { Engine } from "./Engine";
import { Stream } from "./Stream";
import { SystemRule } from "./SystemRule";
import { Table } from "./Table";
import { Tag } from "./Tag";
import { Task } from "./Task";
import { User } from "./User";

import {
  IAbout,
  IApp,
  IRemoveFilter,
  IContentLibrary,
  ICustomProperty,
  IEngine,
  IExtension,
  ISystemRule,
  IHttpReturn,
  IHttpReturnRemove,
  IStream,
  ITag,
  ITask,
  ITaskExecutionResult,
  IUser,
} from "./interfaces";
export {
  IAbout,
  IApp,
  IRemoveFilter,
  IContentLibrary,
  ICustomProperty,
  IEngine,
  IExtension,
  ISystemRule,
  IHttpReturn,
  IHttpReturnRemove,
  IStream,
  ITag,
  ITask,
  ITaskExecutionResult,
  IUser,
};

import {
  IExtensionUpdate,
  IUserUpdate,
  IUserCreate,
  IStreamUpdate,
  ITaskCreateTriggerSchema,
  ITaskCreateTriggerComposite,
  ITaskCreate,
  ITableCreate,
  IStreamCreate,
  ISystemRuleUpdate,
  ISystemRuleCreate,
  IExtensionImport,
  IEngineUpdate,
  ICustomPropertyUpdate,
  ICustomPropertyCreate,
  IContentLibraryUpdate,
  IAppUpdate,
} from "./interfaces/argument.interface";
export {
  IExtensionUpdate,
  IUserUpdate,
  IUserCreate,
  IStreamUpdate,
  ITaskCreateTriggerSchema,
  ITaskCreateTriggerComposite,
  ITaskCreate,
  ITableCreate,
  IStreamCreate,
  ISystemRuleUpdate,
  ISystemRuleCreate,
  IExtensionImport,
  IEngineUpdate,
  ICustomPropertyUpdate,
  ICustomPropertyCreate,
  IContentLibraryUpdate,
  IAppUpdate,
};

export class QlikRepoApi implements App, Stream {
  public repoClient: QlikRepositoryClient;
  public genericClient: QlikGenericRestClient;
  constructor(public repoConfig: any) {
    this.repoClient = new QlikRepositoryClient(repoConfig);
    this.genericClient = new QlikGenericRestClient(repoConfig);
  }

  aboutGet = About.prototype.aboutGet;
  aboutEnums = About.prototype.aboutEnums;
  aboutOpenApi = About.prototype.aboutOpenApi;
  aboutApiRelations = About.prototype.aboutApiRelations;
  aboutApiDescription = About.prototype.aboutApiDescription;
  aboutApiDefaults = About.prototype.aboutApiDefaults;

  appGet = App.prototype.appGet;
  appGetFilter = App.prototype.appGetFilter;
  appImport = App.prototype.appImport;
  appRemove = App.prototype.appRemove;
  appRemoveFilter = App.prototype.appRemoveFilter;
  appCopy = App.prototype.appCopy;
  appExport = App.prototype.appExport;
  appPublish = App.prototype.appPublish;
  appUpdate = App.prototype.appUpdate;

  contentLibraryGet = ContentLibrary.prototype.contentLibraryGet;
  contentLibraryGetFilter = ContentLibrary.prototype.contentLibraryGetFilter;
  contentLibraryCreate = ContentLibrary.prototype.contentLibraryCreate;
  contentLibraryRemove = ContentLibrary.prototype.contentLibraryRemove;
  contentLibraryUpdate = ContentLibrary.prototype.contentLibraryUpdate;

  customPropertyGet = CustomProperty.prototype.customPropertyGet;
  customPropertyGetFilter = CustomProperty.prototype.customPropertyGetFilter;
  customPropertyCreate = CustomProperty.prototype.customPropertyCreate;
  customPropertyRemove = CustomProperty.prototype.customPropertyRemove;
  customPropertyUpdate = CustomProperty.prototype.customPropertyUpdate;

  extensionGet = Extension.prototype.extensionGet;
  extensionGetFilter = Extension.prototype.extensionGetFilter;
  extensionRemove = Extension.prototype.extensionRemove;
  extensionUpdate = Extension.prototype.extensionUpdate;
  extensionImport = Extension.prototype.extensionImport;
  extensionExport = Extension.prototype.extensionExport;

  engineGet = Engine.prototype.engineGet;
  engineGetAll = Engine.prototype.engineGetAll;
  engineGetFilter = Engine.prototype.engineGetFilter;
  engineUpdate = Engine.prototype.engineUpdate;

  streamGet = Stream.prototype.streamGet;
  streamGetFilter = Stream.prototype.streamGetFilter;
  streamCreate = Stream.prototype.streamCreate;
  streamRemove = Stream.prototype.streamRemove;
  streamUpdate = Stream.prototype.streamUpdate;

  ruleGet = SystemRule.prototype.ruleGet;
  ruleGetFilter = SystemRule.prototype.ruleGetFilter;
  ruleCreate = SystemRule.prototype.ruleCreate;
  ruleRemove = SystemRule.prototype.ruleRemove;
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
  taskUpdate = Task.prototype.taskUpdate;
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
}
