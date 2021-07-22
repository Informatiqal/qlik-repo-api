import { QlikRepoApi } from "./main";

import { IUserDirectory } from "./interfaces";

export class UserDirectory {
  constructor() {}

  public async userDirectoryCount(this: QlikRepoApi): Promise<number> {
    return await this.repoClient
      .Get(`userdirectory/count`)
      .then((res: any) => res.data as number);
  }

  public async userDirectoryGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IUserDirectory[]> {
    let url = "userdirectory";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res: any) => {
      if (res.data.length > 0) return res.data as IUserDirectory[];

      return [res.data];
    });
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
}
