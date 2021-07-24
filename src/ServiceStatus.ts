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
    id?: string
  ): Promise<IServiceStatus[] | IServiceStatusCondensed[]> {
    let url = "ServiceStatus";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res) => {
      if (!id) return res.data as IServiceStatusCondensed[];
      return [res.data] as IServiceStatus[];
    });
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
