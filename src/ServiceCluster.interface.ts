export interface IServiceClusterCondensed {
  id?: string;
  privileges?: string[];
  name: string;
}

export interface IServiceCluster extends IServiceClusterCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  settings: IServiceClusterSettings;
}

export interface IServiceClusterSettingsDbCredentials {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  userName?: string;
  password?: string;
}

export interface IServiceClusterSettingsEncryption {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  enableEncryptQvf?: boolean;
  enableEncryptQvd?: boolean;
  encryptionKeyThumbprint?: string;
}

export interface IServiceClusterSettingsSharedPersistenceProperties {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  rootFolder?: string;
  appFolder?: string;
  staticContentRootFolder?: string;
  connector32RootFolder?: string;
  connector64RootFolder?: string;
  archivedLogsRootFolder?: string;
  databaseHost?: string;
  databasePort?: number;
  sSLPort?: number;
  failoverTimeout?: number;
}

export interface IServiceClusterSettings {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  persistenceMode: number;
  dataCollection?: boolean;
  tasksImpersonation?: boolean;
  databaseCredentials: IServiceClusterSettingsDbCredentials;
  encryption: IServiceClusterSettingsEncryption;
  sharedPersistenceProperties: IServiceClusterSettingsSharedPersistenceProperties;
}

export interface IServiceClusterUpdate {
  name?: string;
  persistenceMode?: number;
  rootFolder?: string;
  appFolder?: string;
  staticContentRootFolder?: string;
  connector32RootFolder?: string;
  connector64RootFolder?: string;
  archivedLogsRootFolder?: string;
  failoverTimeout?: number;
  enableEncryptQvf?: boolean;
  enableEncryptQvd?: boolean;
  encryptionKeyThumbprint?: string;
}
