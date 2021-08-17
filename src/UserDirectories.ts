import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { IEntityRemove, IHttpStatus, ISelection } from "./types/interfaces";
import { ITagCondensed } from "./Tags";
import { IClassUserDirectory, UserDirectory } from "./UserDirectory";
import { GetCommonProperties } from "./util/GetCommonProps";

export type TUserDirectoryTypes =
  | "LDAP.ActiveDirectory"
  | "LDAP.AdvancedLDAP"
  | "LDAP.ApacheDs"
  | "LDAP.GenericLDAP"
  | "ODBC.ODBC"
  | "ODBC.OdbcAccess"
  | "ODBC.OdbcExcel"
  | "ODBC.OdbcSQL"
  | "ODBC.OdbcTeradata";

export interface IUserDirectoryCondensed {
  id?: string;
  privileges?: string[];
  name: string;
  type: TUserDirectoryTypes;
}

export interface IUserDirectorySettings {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  name?: string;
  category?: string;
  userDirectorySettingType?: number;
  secret?: boolean;
  value?: string;
  secretValue?: string;
}

export interface IUserDirectory extends IUserDirectoryCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  userDirectoryName?: string;
  configured?: boolean;
  operational?: boolean;
  syncOnlyLoggedInUsers: boolean;
  syncStatus: boolean;
  syncLastStarted?: string;
  syncLastSuccessfulEnded?: string;
  configuredError?: string;
  operationalError?: string;
  tags: ITagCondensed[];
  creationType: number;
  settings?: IUserDirectorySettings[];
}

export interface IUserDirectoryUpdate {
  name?: string;
  userDirectoryName?: string;
  syncOnlyLoggedInUsers?: boolean;
  tags?: string[];
  settings?: IUserDirectorySettingItem[];
}

export interface IUserDirectoryCreate {
  name: string;
  userDirectoryName: string;
  type: TUserDirectoryTypes;
  syncOnlyLoggedInUsers?: boolean;
  tags?: string[];
  settings?: IUserDirectorySettingItem[];
}

export interface IUserDirectorySettingItem {
  name:
    | "Path"
    | "User name"
    | "Password"
    | "LDAP Filter"
    | "Synchronization timeout in seconds"
    | "Page size"
    | "Auth type"
    | "User directory name"
    | "Host"
    | "Connection timeout in seconds"
    | "Base DN"
    | "Use optimized query"
    | "Flags"
    | "Locator Flags"
    | "Protocol Version"
    | "Sasl Method"
    | "Certificate path"
    | "Attribute name of node type"
    | "Attribute value of node type identifying a user"
    | "Attribute value of node type identifying a group"
    | "Attribute name of account"
    | "Attribute name of email"
    | "Attribute name of display name"
    | "Attribute name of group membership"
    | "Attribute name of members of node"
    | "Custom Attributes"
    | "Users table"
    | "Attributes table"
    | "Connection string part 1"
    | "Connection string part 2 (secret)";
  secret?: boolean;
  userDirectorySettingType: "String" | "Int" | "Bool";
  value: string;
  secretValue?: string;
}

export interface IClassUserDirectories {
  count(): Promise<number>;
  get(id: string): Promise<IClassUserDirectory>;
  getAll(): Promise<IClassUserDirectory[]>;
  getFilter(filter: string): Promise<IClassUserDirectory[]>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
  syncMany(userDirectoryIds: string[]): Promise<IHttpStatus>;
  create(arg: IUserDirectoryCreate): Promise<IClassUserDirectory>;
}

export class UserDirectories implements IClassUserDirectories {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async count() {
    return await this.repoClient
      .Get(`userdirectory/count`)
      .then((res) => res.data as number);
  }

  public async get(id: string) {
    if (!id) throw new Error(`userDirectories.get: "id" parameter is required`);

    const ud: UserDirectory = new UserDirectory(this.repoClient, id);
    await ud.init();

    return ud;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`userdirectory/full`)
      .then((res) => res.data as IUserDirectory[])
      .then((data) => {
        return data.map((t) => new UserDirectory(this.repoClient, t.id, t));
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(
        `userDirectory.getFilter: "filter" parameter is required`
      );

    return await this.repoClient
      .Get(`userdirectory/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IUserDirectory[])
      .then((data) => {
        return data.map((t) => new UserDirectory(this.repoClient, t.id, t));
      });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `userDirectory.removeFilter: "filter" parameter is required`
      );

    const uds = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      uds.map((ud: IClassUserDirectory) =>
        ud.remove().then((s) => ({ id: ud.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/userdirectory`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async syncMany(userDirectoryIds: string[]) {
    if (!userDirectoryIds)
      throw new Error(`userDirectory.sync: "ids" parameter is required`);

    return await this.repoClient
      .Post(`userdirectoryconnector/syncuserdirectories`, [...userDirectoryIds])
      .then((res) => res.status as IHttpStatus);
  }

  public async create(arg: IUserDirectoryCreate) {
    if (!arg.name)
      throw new Error(`userDirectories.create: "name" parameter is required`);
    if (!arg.userDirectoryName)
      throw new Error(
        `userDirectories.create: "userDirectoryName" parameter is required`
      );
    if (!arg.type)
      throw new Error(`userDirectories.create: "type" parameter is required`);

    let obj = { ...arg } as any;
    obj.type = `Repository.UserDirectoryConnectors.${arg.type}`;

    const getCommonProps = new GetCommonProperties(
      this.repoClient,
      [],
      arg.tags,
      ""
    );

    const commonProps = await getCommonProps.getAll();

    return await this.repoClient
      .Post(`userdirectory`, { ...obj, ...commonProps })
      .then((res) => res.data as IUserDirectory)
      .then((ud) => new UserDirectory(this.repoClient, ud.id, ud));
  }
}
