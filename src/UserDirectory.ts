import { QlikRepositoryClient } from "./main";

import { IEntityRemove, IHttpStatus } from "./types/interfaces";
import { ITagCondensed } from "./Tag";

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

export interface IClassUserDirectory {
  count(): Promise<number>;
  get(id: string): Promise<IUserDirectory>;
  getAll(): Promise<IUserDirectoryCondensed[]>;
  getFilter(filter: string): Promise<IUserDirectory[]>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  sync(userDirectoryIds: string[]): Promise<IHttpStatus>;
  update(): Promise<boolean>;
}

export class UserDirectory implements IClassUserDirectory {
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
    if (!id) throw new Error(`userDirectoryGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`userdirectory/${id}`)
      .then((res) => res.data as IUserDirectory);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`userdirectory`)
      .then((res) => res.data as IUserDirectoryCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`userDirectoryGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`userdirectory/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IUserDirectory[]);
  }

  public async remove(id: string) {
    if (!id) throw new Error(`userDirectoryRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`userdirectory/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `userDirectoryRemoveFilter: "filter" parameter is required`
      );

    const userDirectories = await this.getAll().then((u: IUserDirectory[]) => {
      if (u.length == 0)
        throw new Error(`tagRemoveFilter: filter query return 0 items`);

      return u;
    });
    return await Promise.all<IEntityRemove>(
      userDirectories.map((ud) => {
        return this.remove(ud.id);
      })
    );
  }

  public async sync(userDirectoryIds: string[]) {
    if (!userDirectoryIds)
      throw new Error(`userDirectorySync: "ids" parameter is required`);

    return await this.repoClient
      .Post(`userdirectoryconnector/syncuserdirectories`, [...userDirectoryIds])
      .then((res) => res.status as IHttpStatus);
  }

  // TODO: Mismatch with the documentation. Investigation required
  public async update() {
    return true;
  }
}
