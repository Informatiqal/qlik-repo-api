import { QlikRepositoryClient } from "qlik-rest-api";
import { IODAGService, IODAGServiceUpdate } from "./types/interfaces";

export class ODAGService {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IODAGService;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IODAGService
  ) {
    if (!id) throw new Error(`odag.get: "id" parameter is required`);

    this.details = {} as IODAGService;
    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init(): Promise<void> {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IODAGService>(`odagservice/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async remove(): Promise<number> {
    return await this.#repoClient
      .Delete(`odagservice/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: IODAGServiceUpdate): Promise<IODAGService> {
    if (arg.anonymousProxyUser && !arg.anonymousProxyUser.userId)
      throw new Error(
        `odag.update: "anonymousProxyUser.userId" value is missing`
      );

    if (arg.anonymousProxyUser && !arg.anonymousProxyUser.userDirectory)
      throw new Error(
        `odag.update: "anonymousProxyUser.userDirectory" value is missing`
      );

    return await this.#repoClient
      .Put<IODAGService>(`odagservice/${this.#id}`, { settings: arg })
      .then((res) => {
        // update the current instance values with the values from the arguments
        Object.entries(arg).map(([n, v]) => {
          this.details[n] = v;
        });

        return res.data;
      });
  }
}
