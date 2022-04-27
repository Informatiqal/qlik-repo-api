import { QlikRepositoryClient } from "qlik-rest-api";
import { GetCommonProperties } from "./util/GetCommonProps";
import { URLBuild } from "./util/generic";
import {
  ISelection,
  IEntityRemove,
  IUserCreate,
  IUser,
} from "./types/interfaces";
import { IClassUser, User } from "./User";

export interface IClassUsers {
  get(arg: { id: string }): Promise<IClassUser>;
  getAll(): Promise<IClassUser[]>;
  getFilter(arg: { filter: string }): Promise<IClassUser[]>;
  create(arg: IUserCreate): Promise<IClassUser>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class Users implements IClassUsers {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`users.get: "id" parameter is required`);
    const user: User = new User(this.#repoClient, arg.id);
    await user.init();

    return user;
  }

  public async getAll() {
    return await this.#repoClient
      .Get(`user/full`)
      .then((res) => res.data as IUser[])
      .then((data) => {
        return data.map((t) => {
          return new User(this.#repoClient, t.id, t);
        });
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`user.getFilter: "filter" parameter is required`);
    return await this.#repoClient
      .Get(`user/full?filter=(${encodeURIComponent(arg.filter)})`)
      .then((res) => res.data as IUser[])
      .then((data) => {
        return data.map((t) => new User(this.#repoClient, t.id, t));
      });
  }

  public async create(arg: IUserCreate) {
    if (!arg.userId)
      throw new Error(`user.create: "userId" parameter is required`);
    if (!arg.userDirectory)
      throw new Error(`user.create: "userDirectory" parameter is required`);

    const getCommonProps = new GetCommonProperties(
      this.#repoClient,
      arg.customProperties,
      arg.tags,
      ""
    );

    const commonProps = await getCommonProps.getAll();

    return await this.#repoClient
      .Post(`user`, {
        userId: arg.userId,
        userDirectory: arg.userDirectory,
        name: arg.name || arg.userId,
        roles: arg.roles || [],
        ...commonProps,
      })
      .then((res) => res.data as IUser)
      .then((u) => new User(this.#repoClient, u.id, u));
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`user.removeFilter: "filter" parameter is required`);

    const users = await this.getFilter({ filter: arg.filter });
    return await Promise.all<IEntityRemove>(
      users.map((user: IClassUser) =>
        user.remove().then((s) => ({ id: user.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/user`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
