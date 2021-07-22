import { QlikRepoApi } from "./main";

import { IServiceStatus } from "./interfaces";

export class ServiceStatus {
  constructor() {}

  public async serviceStatusCount(this: QlikRepoApi): Promise<number> {
    return await this.repoClient
      .Get(`ServiceStatus/count`)
      .then((res: any) => res.data as number);
  }

  public async serviceStatusGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IServiceStatus[]> {
    let url = "ServiceStatus";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res: any) => {
      if (res.data.length > 0) return res.data as IServiceStatus[];

      return [res.data];
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
