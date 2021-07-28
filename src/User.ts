import { QlikRepositoryClient } from "qlik-rest-api";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { GetCommonProperties } from "./util/GetCommonProps";
import {
  IHttpStatus,
  IEntityRemove,
  ICustomPropertyObject,
} from "./types/interfaces";

import { ITagCondensed } from "./Tag";
import { ICustomPropertyCondensed } from "./CustomProperty";

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
  customProperties: ICustomPropertyCondensed[] | ICustomPropertyObject[];
  inactive: boolean;
  modifiedDate: string;
  attributes: IUserAttributes[];
}
export interface IUserUpdate {
  id: string;
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

export interface IClassUser {
  get(id: string): Promise<IUser>;
  getAll(): Promise<IUserCondensed[]>;
  getFilter(filter: string, full?: boolean): Promise<IUserCondensed[]>;
  create(arg: IUserCreate): Promise<IUser>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  update(arg: IUserUpdate): Promise<IUser>;
}

export class User implements IClassUser {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`userGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`user/${id}`)
      .then((res) => res.data as IUser);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`user`)
      .then((res) => res.data as IUserCondensed[]);
  }

  public async getFilter(
    filter: string,
    full = true
  ): Promise<IUserCondensed[]> {
    if (!filter)
      throw new Error(`userGetFilter: "filter" parameter is required`);

    let baseUrl = `user`;
    if (full) baseUrl += `/full`;
    return await this.repoClient
      .Get(`${baseUrl}?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IUserCondensed[]);
  }

  public async create(arg: IUserCreate) {
    if (!arg.userId)
      throw new Error(`userCreate: "userId" parameter is required`);
    if (!arg.userDirectory)
      throw new Error(`userCreate: "userDirectory" parameter is required`);

    let getCommonProps = new GetCommonProperties(
      this,
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
      .then((res) => res.data as IUser);
  }

  public async remove(id: string) {
    if (!id) throw new Error(`userRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`user/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async removeFilter(filter: string): Promise<IEntityRemove[]> {
    if (!filter)
      throw new Error(`userRemoveFilter: "filter" parameter is required`);

    const users = await this.getFilter(filter);
    return await Promise.all<IEntityRemove>(
      users.map((user: IUser) => {
        return this.remove(user.id);
      })
    );
  }

  public async update(arg: IUserUpdate) {
    if (!arg.id) throw new Error(`userUpdate: "id" parameter is required`);

    let user = await this.get(arg.id);

    if (arg.roles) user.roles = arg.roles;
    if (arg.name) user.name = arg.name;

    let updateCommon = new UpdateCommonProperties(this, user, arg);
    user = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`user/${arg.id}`, { ...user })
      .then((res) => res.data as IUser);
  }
}
