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

export interface IClassUserDirectories {
  count(): Promise<number>;
  get(id: string): Promise<UserDirectory>;
  getAll(): Promise<UserDirectory[]>;
  getFilter(filter: string): Promise<UserDirectory[]>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
  syncMany(userDirectoryIds: string[]): Promise<IHttpStatus>;
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

  public async get(id: string) {
    if (!id) throw new Error(`userDirectories.get: "id" parameter is required`);

    const ud: UserDirectory = new UserDirectory(this.#repoClient, id);
    await ud.init();

    return ud;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IUserDirectory[]>(`userdirectory/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map(
          (t) => new UserDirectory(this.#repoClient, t.id ?? "", t)
        );
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(
        `userDirectory.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get<IUserDirectory[]>(
        `userdirectory/full?filter=(${encodeURIComponent(filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map(
          (t) => new UserDirectory(this.#repoClient, t.id ?? "", t)
        );
      });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `userDirectory.removeFilter: "filter" parameter is required`
      );

    const uds = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      uds.map((ud) =>
        ud.remove().then((s) => ({ id: ud.details.id ?? "", status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/userdirectory`);
    urlBuild.addParam("filter", filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async syncMany(userDirectoryIds: string[]) {
    if (!userDirectoryIds)
      throw new Error(`userDirectory.sync: "ids" parameter is required`);

    return await this.#repoClient
      .Post(`userdirectoryconnector/syncuserdirectories`, [...userDirectoryIds])
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
      arg.tags ?? [],
      ""
    );

    const commonProps = await getCommonProps.getAll();

    return await this.#repoClient
      .Post<IUserDirectory>(`userdirectory`, { ...obj, ...commonProps })
      .then((res) => res.data)
      .then((ud) => new UserDirectory(this.#repoClient, ud.id ?? "", ud));
  }
}
