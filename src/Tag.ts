import { QlikRepositoryClient } from "qlik-rest-api";
import { QlikRepoApi } from "./main";

export interface ITagCondensed {
  privileges: string[];
  name: string;
  id: string;
}

export interface ITag extends ITagCondensed {
  createdDate: string;
  schemaPath: string;
  modifiedDate: string;
}

import {
  IHttpStatus,
  IHttpReturnRemove,
  IHttpReturn,
  IRemoveFilter,
} from "./interfaces";
import { modifiedDateTime } from "./util/generic";

export class Tag {
  private repoClient: QlikRepositoryClient;
  constructor(private main: QlikRepoApi) {
    this.repoClient = main.repoClient;
  }

  public async tagGet(id: string): Promise<ITag> {
    if (!id) throw new Error(`tagGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`tag/${id}`)
      .then((res) => res.data as ITag);
  }

  public async tagGetAll(): Promise<ITagCondensed[]> {
    return await this.repoClient
      .Get(`tag`)
      .then((res) => res.data as ITagCondensed[]);
  }

  public async tagGetFilter(filter: string): Promise<ITagCondensed[]> {
    if (!filter)
      throw new Error(`tagGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`tag/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITagCondensed[]);
  }

  public async tagCreate(name: string): Promise<ITag> {
    if (!name) throw new Error(`tagCreate: "name" is required`);

    return await this.repoClient
      .Post(`tag`, { name })
      .then((res) => res.data as ITag);
  }

  public async tagRemove(id: string): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`tagRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`tag/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async tagRemoveFilter(filter: string): Promise<IRemoveFilter[]> {
    if (!filter)
      throw new Error(`tagRemoveFilter: "filter" parameter is required`);

    const tags = await this.tagGetFilter(filter).then((t: ITag[]) => {
      if (t.length == 0)
        throw new Error(`tagRemoveFilter: filter query return 0 items`);

      return t;
    });
    return await Promise.all<IRemoveFilter>(
      tags.map((tag: ITag) => {
        return this.tagRemove(tag.id);
      })
    );
  }

  public async tagUpdate(id: string, name: string): Promise<ITag> {
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
