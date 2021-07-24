import { QlikRepoApi } from "./main";

import {
  IHttpStatus,
  ITag,
  ITagCondensed,
  IHttpReturnRemove,
  IHttpReturn,
  IRemoveFilter,
} from "./interfaces";
import { modifiedDateTime } from "./util/generic";

export class Tag {
  constructor() {}

  public async tagGet(
    this: QlikRepoApi,
    id: string
  ): Promise<ITag[] | ITagCondensed[]> {
    if (!id) throw new Error(`tagGet: "id" parameter is required`);

    return await this.repoClient.Get(`tag/${id}`).then((res) => {
      if (!id) return res.data as ITagCondensed[];

      return [res.data] as ITag[];
    });
  }

  public async tagGetAll(this: QlikRepoApi): Promise<ITag[]> {
    return await this.repoClient.Get(`tag`).then((res) => res.data as ITag[]);
  }

  public async tagGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<ITagCondensed[]> {
    if (!filter)
      throw new Error(`tagGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`tag/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITag[]);
  }

  public async tagCreate(this: QlikRepoApi, name: string): Promise<ITag> {
    if (!name) throw new Error(`"Name" is required`);

    return await this.repoClient
      .Post(`tag`, { name })
      .then((res) => res.data as ITag);
  }

  public async tagRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`tagRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`tag/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async tagRemoveFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IRemoveFilter[]> {
    if (!filter)
      throw new Error(`tagRemoveFilter: "filter" parameter is required`);

    const tags = await this.tagGetFilter(filter).then((t: ITag[]) => {
      if (t.length == 0)
        throw new Error(`tagRemoveFilter: filter query return 0 items`);

      return t;
    });
    return await Promise.all<IRemoveFilter>(
      tags.map((tag: ITag) => {
        return this.repoClient
          .Delete(`tag/${tag.id}`)
          .then((res: IHttpReturn) => {
            return { id: tag.id, status: res.status };
          });
      })
    );
  }

  public async tagUpdate(
    this: QlikRepoApi,
    id: string,
    name: string
  ): Promise<ITag> {
    if (!id) throw new Error(`tagUpdate: "id" parameter is required`);
    if (!name) throw new Error(`tagUpdate: "name" parameter is required`);

    let tag = await this.tagGet(id).then((t) => t[0] as ITag);
    tag.name = name;
    tag.modifiedDate = modifiedDateTime();

    return await this.repoClient
      .Put(`tag/${id}`, { ...tag })
      .then((res) => res.data as ITag);
  }
}
