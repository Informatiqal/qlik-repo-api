import { QlikRepoApi } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import {
  IHttpStatus,
  IUser,
  IUserCondensed,
  IHttpReturnRemove,
  IRemoveFilter,
  IHttpReturn,
} from "./interfaces";

import { IUserUpdate, IUserCreate } from "./interfaces/argument.interface";

export class User {
  constructor() {}

  public async userGet(this: QlikRepoApi, id: string): Promise<IUser> {
    if (!id) throw new Error(`userGet: "id" parameter is required`);

    return await this.repoClient
      .Get(`user/${id}`)
      .then((res) => res.data as IUser);
  }

  public async userGetFilter(
    this: QlikRepoApi,
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

  public async userCreate(this: QlikRepoApi, arg: IUserCreate): Promise<IUser> {
    if (!arg.userId)
      throw new Error(`userCreate: "userId" parameter is required`);
    if (!arg.userDirectory)
      throw new Error(`userCreate: "userDirectory" parameter is required`);

    return await this.repoClient
      .Post(`user`, {
        userId: arg.userId,
        userDirectory: arg.userDirectory,
        name: arg.name || arg.userId,
        roles: arg.roles || [],
      })
      .then((res) => res.data as IUser);
  }

  public async userRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`userRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`user/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async userRemoveFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IRemoveFilter[]> {
    if (!filter)
      throw new Error(`userRemoveFilter: "filter" parameter is required`);

    const users = await this.userGetFilter(filter);
    return await Promise.all<IRemoveFilter>(
      users.map((user: IUser) => {
        return this.repoClient
          .Delete(`user/${user.id}`)
          .then((res: IHttpReturn) => {
            return { id: user.id, status: res.status };
          });
      })
    );
  }

  public async userUpdate(this: QlikRepoApi, arg: IUserUpdate): Promise<IUser> {
    if (!arg.id) throw new Error(`userUpdate: "id" parameter is required`);

    let user = await this.userGet(arg.id);

    if (arg.roles) user.roles = arg.roles;
    if (arg.name) user.name = arg.name;
    if (arg.modifiedByUserName)
      user.modifiedByUserName = arg.modifiedByUserName;

    let updateCommon = new UpdateCommonProperties(this, user, arg);
    user = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`user/${arg.id}`, { ...user })
      .then((res) => res.data as IUser);
  }
}
