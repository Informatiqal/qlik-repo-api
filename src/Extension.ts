import { QlikRepositoryClient } from "qlik-rest-api";
import {
  IUpdateObjectOptions,
  IExtension,
  IExtensionUpdate,
} from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";

import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassExtension {
  remove(): Promise<IHttpStatus>;
  update(
    arg: IExtensionUpdate,
    options?: IUpdateObjectOptions
  ): Promise<IExtension>;
  details: IExtension;
}

export class Extension implements IClassExtension {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IExtension;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IExtension
  ) {
    if (!id) throw new Error(`extension.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get(`extension/${this.#id}`)
        .then((res) => res.data as IExtension);
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`extension/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: IExtensionUpdate, options?: IUpdateObjectOptions) {
    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put(`extension/${this.details.id}`, { ...this.details })
      .then((res) => res.data as IExtension);
  }
}
