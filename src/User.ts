import { QlikRepositoryClient } from "qlik-rest-api";
import {
  IEntityRemove,
  IHttpStatus,
  IUpdateObjectOptions,
} from "./types/interfaces";
import { IUser, IUserUpdate } from "./Users";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassUser {
  remove(): Promise<IHttpStatus>;
  update(arg: IUserUpdate, options?: IUpdateObjectOptions): Promise<IUser>;
  details: IUser;
}

export class User implements IClassUser {
  private repoClient: QlikRepositoryClient;
  public id: string;
  details: IUser;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: IUser) {
    if (!id) throw new Error(`users.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`user/${this.id}`)
        .then((res) => res.data as IUser);
    }
  }

  public async remove() {
    return await this.repoClient
      .Delete(`user/${this.id}`)
      .then((res) => res.status);
  }

  public async update(arg: IUserUpdate, options?: IUpdateObjectOptions) {
    if (arg.roles) this.details.roles = arg.roles;
    if (arg.name) this.details.name = arg.name;

    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`user/${this.details.id}`, { ...this.details })
      .then((res) => res.data as IUser);
  }
}
