import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import {
  IEntityRemove,
  ISelection,
  IUserDirectory,
  IUserDirectoryCreate,
} from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { UserDirectory } from "./UserDirectory";
import { GetCommonProperties } from "./util/GetCommonProps";
import { SelectionEntity } from "./util/SelectionEntity";

export interface IClassUserDirectories {
  count(): Promise<number>;
  get(arg: { id: string }): Promise<UserDirectory>;
  getAll(): Promise<UserDirectory[]>;
  getFilter(arg: { filter: string }): Promise<UserDirectory[]>;
  removeFilter(arg: { filter: string }): Promise<number>;
  select(arg?: { filter: string }): Promise<ISelection>;
  syncMany(arg: { userDirectoryIds: string[] }): Promise<IHttpStatus>;
  create(arg: IUserDirectoryCreate): Promise<UserDirectory>;
}

export class UserDirectories implements IClassUserDirectories {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async count() {
    return await this.#repoClient
      .Get<number>(`userdirectory/count`)
      .then((res) => res.data);
  }

  public async get(arg: { id: string }) {
    if (!arg.id)
      throw new Error(`userDirectories.get: "id" parameter is required`);

    const ud: UserDirectory = new UserDirectory(this.#repoClient, arg.id);
    await ud.init();

    return ud;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IUserDirectory[]>(`userdirectory/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new UserDirectory(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `userDirectory.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get<IUserDirectory[]>(
        `userdirectory/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new UserDirectory(this.#repoClient, t.id, t));
      });
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `userDirectory.removeFilter: "filter" parameter is required`
      );

    const selection = new SelectionEntity(this.#repoClient, "userdirectory");
    await selection.init({ filter: arg.filter });
    const removeStatus = await selection.removeAllItems();

    return removeStatus;
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/userdirectory`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async syncMany(arg: { userDirectoryIds: string[] }) {
    if (!arg.userDirectoryIds)
      throw new Error(`userDirectory.sync: "ids" parameter is required`);

    return await this.#repoClient
      .Post(`userdirectoryconnector/syncuserdirectories`, [
        ...arg.userDirectoryIds,
      ])
      .then((res) => res.status);
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
      this.#repoClient,
      [],
      arg.tags,
      ""
    );

    const commonProps = await getCommonProps.getAll();

    return await this.#repoClient
      .Post<IUserDirectory>(`userdirectory`, { ...obj, ...commonProps })
      .then((res) => res.data)
      .then((ud) => new UserDirectory(this.#repoClient, ud.id, ud));
  }
}
