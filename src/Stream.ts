import { QlikRepoApi } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IHttpStatus, IStream } from "./interfaces";
import { IStreamCreate, IStreamUpdate } from "./interfaces/argument.interface";

export class Stream {
  constructor() {}

  public async streamGet(this: QlikRepoApi, id: string): Promise<IStream> {
    return await this.repoClient
      .Get(`stream/${id}`)
      .then((res) => res.data as IStream);
  }

  public async streamGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IStream[]> {
    return await this.repoClient
      .Get(`stream?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IStream[]);
  }

  public async streamCreate(
    this: QlikRepoApi,
    arg: IStreamCreate
  ): Promise<IStream> {
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
    return await this.repoClient
      .Delete(`stream/${id}`)
      .then((res) => res.status as IHttpStatus);
  }

  public async streamUpdate(
    this: QlikRepoApi,
    arg: IStreamUpdate
  ): Promise<IStream> {
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
