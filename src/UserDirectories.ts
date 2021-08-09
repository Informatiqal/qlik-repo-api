import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { IEntityRemove, IHttpStatus, ISelection } from "./types/interfaces";
import { ITagCondensed } from "./Tags";
import { IClassUserDirectory, UserDirectory } from "./UserDirectory";

export interface IUserDirectoryCondensed {
  id?: string;
  privileges?: string[];
  name: string;
  type: string;
}

export interface IUserDirectorySettings {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  name: string;
  category?: string;
  userDirectorySettingType: number;
  secret: boolean;
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
  settings?: IUserDirectorySettings;
}

export interface IUserDirectoryUpdate {
  id: string;
  name: string;
  path: string;
  userName: string;
  password: string;
  ldapFilter: string;
  timeout: string;
  pageSize: string;
  tags?: string[];
  customProperties?: string[];
}

export interface IClassUserDirectories {
  count(): Promise<number>;
  get(id: string): Promise<IClassUserDirectory>;
  getAll(): Promise<IClassUserDirectory[]>;
  getFilter(filter: string): Promise<IClassUserDirectory[]>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
  syncMany(userDirectoryIds: string[]): Promise<IHttpStatus>;
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
        return data.map((t) => {
          return new UserDirectory(this.repoClient, t.id, t);
        });
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
        return data.map((t) => {
          return new UserDirectory(this.repoClient, t.id, t);
        });
      });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `userDirectory.removeFilter: "filter" parameter is required`
      );

    const uds = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      uds.map((ud: IClassUserDirectory) => {
        return ud.remove();
      })
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
}
