import { QlikRepositoryClient } from "qlik-rest-api";
import { IUpdateObjectOptions, IUser, IUserUpdate } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";

import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassUser {
  remove(): Promise<IHttpStatus>;
  update(arg: IUserUpdate, options?: IUpdateObjectOptions): Promise<IUser>;
  details: IUser;
}

export class User implements IClassUser {
  #repoClient: QlikRepositoryClient;
  #id: string;
  details: IUser;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: IUser) {
    if (!id) throw new Error(`users.get: "id" parameter is required`);

    this.details = {} as IUser;
    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IUser>(`user/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`user/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: IUserUpdate, options?: IUpdateObjectOptions) {
    if (arg.roles) this.details.roles = arg.roles;
    if (arg.name) this.details.name = arg.name;

    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put<IUser>(`user/${this.details.id}`, { ...this.details })
      .then((res) => res.data);
  }
}
