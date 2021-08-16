import { QlikRepositoryClient } from "qlik-rest-api";
import { GetCommonProperties } from "./util/GetCommonProps";
import { URLBuild } from "./util/generic";
import { ISelection, IEntityRemove } from "./types/interfaces";
import { ITagCondensed } from "./Tags";
import { ICustomPropertyValue } from "./CustomProperties";
import { IClassUser, User } from "./User";

export interface IUserCondensed {
  privileges: string[];
  userDirectoryConnectorName: string;
  userDirectory: string;
  userId: string;
  name: string;
  id: string;
}

export interface IUserAttributes {
  createdDate: string;
  attributeValue: string;
  attributeType: string;
  schemaPath: string;
  modifiedDate: string;
  externalId: string;
  id: string;
}

export interface IUser extends IUserCondensed {
  removedExternally: boolean;
  schemaPath: string;
  roles: string[];
  deleteProhibited: boolean;
  tags: ITagCondensed[];
  blacklisted: boolean;
  createdDate: string;
  customProperties: ICustomPropertyValue[];
  inactive: boolean;
  modifiedDate: string;
  attributes: IUserAttributes[];
}
export interface IUserUpdate {
  // id: string;
  tags?: string[];
  customProperties?: string[];
  name?: string;
  roles?: string[];
}

export interface IUserCreate {
  userId: string;
  userDirectory: string;
  name?: string;
  roles?: string[];
  tags?: string[];
  customProperties?: string[];
}

export interface IOwner {
  privileges: [];
  userDirectory: string;
  userDirectoryConnectorName: string;
  name: string;
  id: string;
  userId: string;
}

export interface IClassUsers {
  get(id: string): Promise<IClassUser>;
  getAll(): Promise<IClassUser[]>;
  getFilter(filter: string): Promise<IClassUser[]>;
  create(arg: IUserCreate): Promise<IClassUser>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
}

export class Users implements IClassUsers {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`users.get: "id" parameter is required`);
    const user: User = new User(this.repoClient, id);
    await user.init();

    return user;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`user/full`)
      .then((res) => res.data as IUser[])
      .then((data) => {
        return data.map((t) => {
          return new User(this.repoClient, t.id, t);
        });
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`user.getFilter: "filter" parameter is required`);
    return await this.repoClient
      .Get(`user/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IUser[])
      .then((data) => {
        return data.map((t) => new User(this.repoClient, t.id, t));
      });
  }

  public async create(arg: IUserCreate) {
    if (!arg.userId)
      throw new Error(`user.create: "userId" parameter is required`);
    if (!arg.userDirectory)
      throw new Error(`user.create: "userDirectory" parameter is required`);

    let getCommonProps = new GetCommonProperties(
      this.repoClient,
      arg.customProperties,
      arg.tags,
      ""
    );

    let commonProps = await getCommonProps.getAll();

    return await this.repoClient
      .Post(`user`, {
        userId: arg.userId,
        userDirectory: arg.userDirectory,
        name: arg.name || arg.userId,
        roles: arg.roles || [],
        ...commonProps,
      })
      .then((res) => res.data as IUser)
      .then((u) => new User(this.repoClient, u.id, u));
  }

  public async removeFilter(filter: string): Promise<IEntityRemove[]> {
    if (!filter)
      throw new Error(`user.removeFilter: "filter" parameter is required`);

    const users = await this.getFilter(filter);
    return await Promise.all<IEntityRemove>(
      users.map((user: IClassUser) =>
        user.remove().then((s) => ({ id: user.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/user`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
