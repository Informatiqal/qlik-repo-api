import { QlikRepositoryClient } from "qlik-rest-api";
import { IHttpStatus } from "./types/ranges";
import { IServiceCluster, IServiceClusterUpdate } from "./types/interfaces";

export interface IClassServiceCluster {
  remove(): Promise<IHttpStatus>;
  update(arg: IServiceClusterUpdate): Promise<IServiceCluster>;
  details: IServiceCluster;
}

export class ServiceCluster implements IClassServiceCluster {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IServiceCluster;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IServiceCluster
  ) {
    if (!id) throw new Error(`serviceClusters.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IServiceCluster>(`ServiceCluster/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`ServiceCluster/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: IServiceClusterUpdate) {
    if (!arg)
      throw new Error(`serviceCluster.update: all arguments are missing`);

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

    return await this.#repoClient
      .Post<IServiceCluster>(`ServiceCluster/${this.details.id}`, {
        ...this.details,
      })
      .then((res) => res.data);
  }
}
