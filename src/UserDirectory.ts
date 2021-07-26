import { QlikRepoApi } from "./main";

import {
  IUserDirectory,
  IUserDirectoryCondensed,
  IRemoveFilter,
  IHttpReturnRemove,
  IHttpStatus,
} from "./interfaces";

export class UserDirectory {
  constructor() {}

  public async userDirectoryCount(this: QlikRepoApi): Promise<number> {
    return await this.repoClient
      .Get(`userdirectory/count`)
      .then((res) => res.data as number);
  }

  public async userDirectoryGet(
    this: QlikRepoApi,
    id: string
  ): Promise<IUserDirectory> {
    if (!id) throw new Error(`userDirectoryGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`userdirectory/${id}`)
      .then((res) => res.data as IUserDirectory);
  }

  public async userDirectoryGetAll(
    this: QlikRepoApi
  ): Promise<IUserDirectoryCondensed[]> {
    return await this.repoClient
      .Get(`userdirectory`)
      .then((res) => res.data as IUserDirectoryCondensed[]);
  }

  public async userDirectoryGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IUserDirectory[]> {
    if (!filter)
      throw new Error(`userDirectoryGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`userdirectory/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IUserDirectory[]);
  }

  public async userDirectoryRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`userDirectoryRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`userdirectory/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async userDirectoryRemoveFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IRemoveFilter[]> {
    if (!filter)
      throw new Error(
        `userDirectoryRemoveFilter: "filter" parameter is required`
      );

    const userDirectories = await this.userDirectoryGetAll().then(
      (u: IUserDirectory[]) => {
        if (u.length == 0)
          throw new Error(`tagRemoveFilter: filter query return 0 items`);

        return u;
      }
    );
    return await Promise.all<IRemoveFilter>(
      userDirectories.map((ud) => {
        return this.userDirectoryRemove(ud.id);
      })
    );
  }

  public async userDirectorySync(
    this: QlikRepoApi,
    userDirectoryIds: string[]
  ): Promise<IHttpStatus> {
    if (!userDirectoryIds)
      throw new Error(`userDirectorySync: "ids" parameter is required`);

    return await this.repoClient
      .Post(`userdirectoryconnector/syncuserdirectories`, [...userDirectoryIds])
      .then((res) => res.status);
  }

  // TODO: Mismatch with the documentation. Investigation required
  public async userDirectoryUpdate(this: QlikRepoApi): Promise<boolean> {
    return true;
  }
}
