import { QlikRepoApi } from "./main";

import {
  IHttpStatus,
  IHttpReturnRemove,
  IHttpReturn,
  IRemoveFilter,
  IServiceCluster,
} from "./interfaces";

import { IServiceClusterUpdate } from "./interfaces/argument.interface";

export class ServiceCluster {
  constructor() {}

  public async serviceClusterCount(this: QlikRepoApi): Promise<number> {
    return await this.repoClient
      .Get(`ServiceCluster/count`)
      .then((res: any) => res.data as number);
  }

  public async serviceClusterGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IServiceCluster[]> {
    let url = "ServiceCluster";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res: any) => {
      if (res.data.length > 0) return res.data as IServiceCluster[];

      return [res.data];
    });
  }

  public async serviceClusterGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IServiceCluster[]> {
    if (!filter)
      throw new Error(
        `serviceClusterGetFilter: "filter" parameter is required`
      );

    return await this.repoClient
      .Get(`ServiceCluster/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IServiceCluster[]);
  }

  public async serviceClusterRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id)
      throw new Error(`serviceClusterRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`ServiceCluster/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async serviceClusterRemoveFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IRemoveFilter[]> {
    if (!filter)
      throw new Error(`serviceClusterFilter: "filter" parameter is required`);

    const serviceClusters = await this.serviceClusterGetFilter(filter).then(
      (s: IServiceCluster[]) => {
        if (s.length == 0)
          throw new Error(`serviceClusterFilter: filter query return 0 items`);

        return s;
      }
    );
    return await Promise.all<IRemoveFilter>(
      serviceClusters.map((serviceCluster: IServiceCluster) => {
        return this.repoClient
          .Delete(`ServiceCluster/${serviceCluster.id}`)
          .then((res: IHttpReturn) => {
            return { id: serviceCluster.id, status: res.status };
          });
      })
    );
  }

  public async serviceClusterSetCentral(
    this: QlikRepoApi,
    id: string
  ): Promise<number> {
    if (!id)
      throw new Error(`serviceClusterSetCentral: "id" parameter is required`);

    return await this.repoClient
      .Get(`failover/tonode/${id}`)
      .then((res) => res.status);
  }

  public async serviceClusterUpdate(
    this: QlikRepoApi,
    arg: IServiceClusterUpdate
  ): Promise<IServiceCluster> {
    if (!arg)
      throw new Error(`serviceClusterUpdate: all arguments are missing`);
    if (arg && !arg.id)
      throw new Error(`serviceClusterUpdate: "id" parameter is required`);

    let serviceCluster = await this.serviceClusterGet(arg.id).then((s) => s[0]);

    if (arg.name) serviceCluster.name = arg.name;
    if (arg.persistenceMode)
      serviceCluster.settings.persistenceMode = arg.persistenceMode;
    if (arg.rootFolder)
      serviceCluster.settings.sharedPersistenceProperties.rootFolder =
        arg.rootFolder;
    if (arg.appFolder)
      serviceCluster.settings.sharedPersistenceProperties.appFolder =
        arg.appFolder;
    if (arg.staticContentRootFolder)
      serviceCluster.settings.sharedPersistenceProperties.staticContentRootFolder =
        arg.staticContentRootFolder;
    if (arg.connector32RootFolder)
      serviceCluster.settings.sharedPersistenceProperties.connector32RootFolder =
        arg.connector32RootFolder;
    if (arg.connector64RootFolder)
      serviceCluster.settings.sharedPersistenceProperties.connector64RootFolder =
        arg.connector64RootFolder;
    if (arg.archivedLogsRootFolder)
      serviceCluster.settings.sharedPersistenceProperties.archivedLogsRootFolder =
        arg.archivedLogsRootFolder;
    if (arg.enableEncryptQvf)
      serviceCluster.settings.encryption.enableEncryptQvf =
        arg.enableEncryptQvf;
    if (arg.enableEncryptQvd)
      serviceCluster.settings.encryption.enableEncryptQvd =
        arg.enableEncryptQvd;
    if (arg.encryptionKeyThumbprint)
      serviceCluster.settings.encryption.encryptionKeyThumbprint =
        arg.encryptionKeyThumbprint;
    if (arg.failoverTimeout)
      serviceCluster.settings.sharedPersistenceProperties.failoverTimeout =
        arg.failoverTimeout;

    return await this.repoClient
      .Post(`ServiceCluster/${arg.id}`, { ...serviceCluster })
      .then((res) => res.data as IServiceCluster);
  }
}
