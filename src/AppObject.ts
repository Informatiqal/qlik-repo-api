import { QlikRepositoryClient } from "qlik-rest-api";
import {
  IEntityRemove,
  IHttpStatus,
  IUpdateObjectOptions,
} from "./types/interfaces";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { IAppObject } from "./AppObjects";

export interface IAppObjectUpdate {
  owner?: string;
  approved?: boolean;
}

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
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: IAppObject;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IAppObject
  ) {
    if (!id) throw new Error(`appObjects.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`app/object/${this.id}`)
        .then((res) => res.data as IAppObject);
    }
  }

  public async publish() {
    return await this.repoClient
      .Put(`app/object/${this.details.id}/publish`, {})
      .then((res) => {
        this.details = res.data;
        return res.status;
      });
  }

  public async unPublish() {
    return await this.repoClient
      .Put(`app/object/${this.details.id}/unpublish`, {})
      .then((res) => {
        this.details = res.data;
        return res.status;
      });
  }

  public async remove() {
    return await this.repoClient
      .Delete(`app/object/${this.details.id}`)
      .then((res) => res.status);
  }

  public async update(arg: IAppObjectUpdate, options?: IUpdateObjectOptions) {
    if (arg.approved) this.details.approved = arg.approved;

    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`app/object/${this.details.id}`, { ...this.details })
      .then((res) => res.data as IAppObject);
  }
}
