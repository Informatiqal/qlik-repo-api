import { QlikRepositoryClient } from "qlik-rest-api";
import { IEntityRemove } from "./types/interfaces";
import {
  IServiceCluster,
  IServiceClusterUpdate,
} from "./ServiceCluster.interface";

export interface IClassServiceCluster {
  remove(): Promise<IEntityRemove>;
  setCentral(): Promise<number>;
  update(arg: IServiceClusterUpdate): Promise<IServiceCluster>;
  details: IServiceCluster;
}

export class ServiceCluster implements IClassServiceCluster {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: IServiceCluster;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IServiceCluster
  ) {
    if (!id) throw new Error(`serviceClusters.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`ServiceCluster/${this.id}`)
        .then((res) => res.data as IServiceCluster);
    }
  }

  public async remove() {
    return await this.repoClient
      .Delete(`ServiceCluster/${this.id}`)
      .then((res) => {
        return { id: this.id, status: res.status } as IEntityRemove;
      });
  }

  // TODO: this should be here or in Node?
  public async setCentral() {
    return await this.repoClient
      .Get(`failover/tonode/${this.details.id}`)
      .then((res) => res.status);
  }

  public async update(arg: IServiceClusterUpdate) {
    if (!arg)
      throw new Error(`serviceCluster.update: all arguments are missing`);
    if (arg && !arg.id)
      throw new Error(`serviceCluster.update: "id" parameter is required`);

    if (arg.name) this.details.name = arg.name;
    if (arg.persistenceMode)
      this.details.settings.persistenceMode = arg.persistenceMode;
    if (arg.rootFolder)
      this.details.settings.sharedPersistenceProperties.rootFolder =
        arg.rootFolder;
    if (arg.appFolder)
      this.details.settings.sharedPersistenceProperties.appFolder =
        arg.appFolder;
    if (arg.staticContentRootFolder)
      this.details.settings.sharedPersistenceProperties.staticContentRootFolder =
        arg.staticContentRootFolder;
    if (arg.connector32RootFolder)
      this.details.settings.sharedPersistenceProperties.connector32RootFolder =
        arg.connector32RootFolder;
    if (arg.connector64RootFolder)
      this.details.settings.sharedPersistenceProperties.connector64RootFolder =
        arg.connector64RootFolder;
    if (arg.archivedLogsRootFolder)
      this.details.settings.sharedPersistenceProperties.archivedLogsRootFolder =
        arg.archivedLogsRootFolder;
    if (arg.enableEncryptQvf)
      this.details.settings.encryption.enableEncryptQvf = arg.enableEncryptQvf;
    if (arg.enableEncryptQvd)
      this.details.settings.encryption.enableEncryptQvd = arg.enableEncryptQvd;
    if (arg.encryptionKeyThumbprint)
      this.details.settings.encryption.encryptionKeyThumbprint =
        arg.encryptionKeyThumbprint;
    if (arg.failoverTimeout)
      this.details.settings.sharedPersistenceProperties.failoverTimeout =
        arg.failoverTimeout;

    return await this.repoClient
      .Post(`ServiceCluster/${arg.id}`, { ...this.details })
      .then((res) => res.data as IServiceCluster);
  }
}
