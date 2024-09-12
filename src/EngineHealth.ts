import { QlikRepositoryClient } from "qlik-rest-api";
import { modifiedDateTime } from "./util/generic";
import { IEngineHealth, IEngineHealthUpdate } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";

export class EngineHealth {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IEngineHealth;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IEngineHealth
  ) {
    if (!id) throw new Error(`engineHealth.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IEngineHealth>(`enginehealth/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async remove(): Promise<IHttpStatus> {
    return await this.#repoClient
      .Delete(`enginehealth/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: IEngineHealthUpdate): Promise<IEngineHealth> {
    this.details = { ...this.details, ...arg };
    this.details.modifiedDate = modifiedDateTime();

    return await this.#repoClient
      .Put<IEngineHealth>(`enginehealth/${this.#id}`, {
        ...this.details,
      })
      .then((res) => res.data);
  }
}
