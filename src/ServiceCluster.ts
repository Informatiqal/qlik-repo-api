import { QlikRepositoryClient } from "./main";

import { IHttpStatus, IEntityRemove } from "./interfaces";
import {
  IServiceCluster,
  IServiceClusterCondensed,
  IServiceClusterUpdate,
} from "./ServiceCluster.interface";

export interface IClassServiceCluster {
  count(): Promise<number>;
  get(id: string): Promise<IServiceCluster>;
  getAll(): Promise<IServiceClusterCondensed[]>;
  getFilter(filter: string): Promise<IServiceClusterCondensed[]>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  setCentral(id: string): Promise<number>;
  update(arg: IServiceClusterUpdate): Promise<IServiceCluster>;
}

export class ServiceCluster implements IClassServiceCluster {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async count() {
    return await this.repoClient
      .Get(`ServiceCluster/count`)
      .then((res) => res.data as number);
  }

  public async get(id: string) {
    if (!id) throw new Error(`serviceClusterGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`ServiceCluster/${id}`)
      .then((res) => res.data as IServiceCluster);
  }

  public async getAll(): Promise<IServiceClusterCondensed[]> {
    return await this.repoClient
      .Get(`ServiceCluster`)
      .then((res) => res.data as IServiceClusterCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(
        `serviceClusterGetFilter: "filter" parameter is required`
      );

    return await this.repoClient
      .Get(`ServiceCluster/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IServiceCluster[]);
  }

  public async remove(id: string) {
    if (!id)
      throw new Error(`serviceClusterRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`ServiceCluster/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(`serviceClusterFilter: "filter" parameter is required`);

    const serviceClusters = await this.getFilter(filter).then(
      (s: IServiceCluster[]) => {
        if (s.length == 0)
          throw new Error(`serviceClusterFilter: filter query return 0 items`);

        return s;
      }
    );
    return await Promise.all<IEntityRemove>(
      serviceClusters.map((serviceCluster: IServiceCluster) => {
        return this.remove(serviceCluster.id);
      })
    );
  }

  public async setCentral(id: string) {
    if (!id)
      throw new Error(`serviceClusterSetCentral: "id" parameter is required`);

    return await this.repoClient
      .Get(`failover/tonode/${id}`)
      .then((res) => res.status);
  }

  public async update(arg: IServiceClusterUpdate): Promise<IServiceCluster> {
    if (!arg)
      throw new Error(`serviceClusterUpdate: all arguments are missing`);
    if (arg && !arg.id)
      throw new Error(`serviceClusterUpdate: "id" parameter is required`);

    let serviceCluster = await this.get(arg.id);

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
