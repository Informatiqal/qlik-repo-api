import { QlikRepositoryClient } from "qlik-rest-api";
import { IOdagRequest } from "./types/interfaces";

export class ODAGRequest {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IOdagRequest;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IOdagRequest
  ) {
    if (!id) throw new Error(`odagRequest.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init(): Promise<IOdagRequest> {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IOdagRequest>(`odagrequest/${this.#id}`)
        .then((res) => res.data);
    }

    return;
  }

  public async remove(): Promise<number> {
    return await this.#repoClient
      .Delete(`odagrequest/${this.#id}`)
      .then((res) => res.status);
  }

  // TODO: validate the input #270
  public async update(arg: Partial<IOdagRequest>): Promise<IOdagRequest> {
    return await this.#repoClient
      .Put<IOdagRequest>(`odagrequest/${this.#id}`, arg)
      .then((res) =>
        this.#repoClient.Get<IOdagRequest>(`odagrequest/${this.#id}/full`)
      )
      .then((res) => {
        this.details = res.data;
        return res.data;
      });
  }
}
