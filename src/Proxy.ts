import { QlikRepoApi } from "./main";

import {
  IHttpStatus,
  IHttpReturnRemove,
  IProxyService,
  IProxyServiceCondensed,
  IVirtualProxyConfig,
  IVirtualProxyConfigCondensed,
} from "./interfaces";

export class Proxy {
  constructor() {}

  public async proxyGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IProxyService[] | IProxyServiceCondensed[]> {
    let url = "proxyservice";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res) => {
      if (!id) return res.data as IProxyServiceCondensed[];

      return [res.data] as IProxyService[];
    });
  }

  public async proxyGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IProxyServiceCondensed[]> {
    if (!filter)
      throw new Error(`proxyGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`proxyservice/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IProxyServiceCondensed[]);
  }

  public async proxyMetadataExport(
    this: QlikRepoApi,
    id: string,
    fileName?: string
  ): Promise<Buffer> {
    if (!fileName) {
      const virtualProxy = await this.virtualProxyGet(id).then(
        (v) => v[0] as IVirtualProxyConfig
      );
      fileName = `${virtualProxy.prefix}_metadata_sp.xml`;
    }

    let exportMetaData: string = await this.repoClient
      .Get(`virtualproxyconfig/${id}/generate/samlmetadata`)
      .then((m) => m.data as string);

    return await this.repoClient
      .Get(`download/samlmetadata/${exportMetaData}/${fileName}`)
      .then((m) => m.data as Buffer);
  }

  public async virtualProxyGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IVirtualProxyConfig[] | IVirtualProxyConfigCondensed[]> {
    let url = "virtualproxyconfig";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res) => {
      if (!id) return res.data as IVirtualProxyConfigCondensed[];

      return [res.data] as IVirtualProxyConfig[];
    });
  }

  public async virtualProxyGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IVirtualProxyConfigCondensed[]> {
    if (!filter)
      throw new Error(`virtualProxyGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`virtualproxyconfig/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IVirtualProxyConfigCondensed[]);
  }

  public async virtualProxyRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`virtualProxyRemove: "id" parameter is required`);

    return await this.repoClient.Get(`virtualproxyconfig/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }
}
