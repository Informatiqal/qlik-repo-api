import { QlikRepoApi } from "./main";

import { IServiceStatus, IServiceStatusCondensed } from "./interfaces";

export class ServiceStatus {
  constructor() {}

  public async serviceStatusCount(this: QlikRepoApi): Promise<number> {
    return await this.repoClient
      .Get(`ServiceStatus/count`)
      .then((res) => res.data as number);
  }

  public async serviceStatusGet(
    this: QlikRepoApi,
    id: string
  ): Promise<IServiceStatus> {
    if (!id) throw new Error(`serviceStatusGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`ServiceStatus/${id}`)
      .then((res) => res.data as IServiceStatus);
  }

  public async serviceStatusGetAll(
    this: QlikRepoApi
  ): Promise<IServiceStatusCondensed[]> {
    return await this.repoClient
      .Get(`ServiceStatus`)
      .then((res) => res.data as IServiceStatusCondensed[]);
  }

  public async serviceStatusGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IServiceStatus[]> {
    if (!filter)
      throw new Error(`serviceStatusGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`ServiceStatus/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IServiceStatus[]);
  }
}
