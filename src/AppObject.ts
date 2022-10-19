import { QlikRepositoryClient } from "qlik-rest-api";
import {
  IAppObjectUpdate,
  IUpdateObjectOptions,
  IAppObject,
} from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassAppObject {
  details: IAppObject;
  publish(): Promise<IHttpStatus>;
  remove(): Promise<IHttpStatus>;
  unPublish(): Promise<IHttpStatus>;
  update(
    arg: IAppObjectUpdate,
    options?: IUpdateObjectOptions
  ): Promise<IAppObject>;
}

export class AppObject implements IClassAppObject {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IAppObject;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IAppObject
  ) {
    if (!id) throw new Error(`appObjects.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IAppObject>(`app/object/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async publish() {
    return await this.#repoClient
      .Put<IAppObject>(`app/object/${this.details.id}/publish`, {})
      .then((res) => {
        this.details = res.data;
        return res.status;
      });
  }

  public async unPublish() {
    return await this.#repoClient
      .Put<IAppObject>(`app/object/${this.details.id}/unpublish`, {})
      .then((res) => {
        this.details = res.data;
        return res.status;
      });
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`app/object/${this.details.id}`)
      .then((res) => res.status);
  }

  public async update(arg: IAppObjectUpdate, options?: IUpdateObjectOptions) {
    if (arg.approved) this.details.approved = arg.approved;

    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put<IAppObject>(`app/object/${this.details.id}`, { ...this.details })
      .then((res) => res.data);
  }
}
