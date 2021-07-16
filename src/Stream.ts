import { QlikRepoApi } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IHttpStatus, IStream } from "./interfaces";
import { IStreamCreate, IStreamUpdate } from "./interfaces/argument.interface";

export class Stream {
  constructor() {}

  public async streamGet(this: QlikRepoApi, id: string): Promise<IStream> {
    if (!id) throw new Error(`streamGet: "id" parameter is required`);

    return await this.repoClient
      .Get(`stream/${id}`)
      .then((res) => res.data as IStream);
  }

  public async streamGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IStream[]> {
    if (!filter)
      throw new Error(`streamGetFilter: "filter" parameter is required`);
    return await this.repoClient
      .Get(`stream?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IStream[]);
  }

  public async streamCreate(
    this: QlikRepoApi,
    arg: IStreamCreate
  ): Promise<IStream> {
    if (!arg.name)
      throw new Error(`streamCreate: "path" parameter is required`);

    return await this.repoClient
      .Post(`stream`, {
        name: arg.name,
      })
      .then((res) => res.data as IStream);
  }

  public async streamRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpStatus> {
    if (!id) throw new Error(`streamRemove: "id" parameter is required`);
    return await this.repoClient
      .Delete(`stream/${id}`)
      .then((res) => res.status as IHttpStatus);
  }

  public async streamUpdate(
    this: QlikRepoApi,
    arg: IStreamUpdate
  ): Promise<IStream> {
    if (!arg.id) throw new Error(`streamUpdate: "id" parameter is required`);

    let stream = await this.streamGet(arg.id);

    if (arg.name) stream.name = arg.name;
    if (arg.modifiedByUserName)
      stream.modifiedByUserName = arg.modifiedByUserName;

    let updateCommon = new UpdateCommonProperties(this, stream, arg);
    stream = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`stream/${arg.id}`, { ...stream })
      .then((res) => res.data as IStream);
  }
}
