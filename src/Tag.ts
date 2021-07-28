import { QlikRepositoryClient } from "qlik-rest-api";
import { IHttpStatus, IEntityRemove } from "./types/interfaces";
import { modifiedDateTime } from "./util/generic";
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

export interface IClassTag {
  get(id: string): Promise<ITag>;
  getAll(): Promise<ITagCondensed[]>;
  getFilter(filter: string, full?: boolean): Promise<ITag[]>;
  create(name: string): Promise<ITag>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  update(id: string, name: string): Promise<ITag>;
}

export class Tag {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`tagGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`tag/${id}`)
      .then((res) => res.data as ITag);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`tag`)
      .then((res) => res.data as ITagCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`tagGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`tag/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITag[]);
  }

  public async create(name: string) {
    if (!name) throw new Error(`tagCreate: "name" is required`);

    return await this.repoClient
      .Post(`tag`, { name })
      .then((res) => res.data as ITag);
  }

  public async remove(id: string) {
    if (!id) throw new Error(`tagRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`tag/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(`tagRemoveFilter: "filter" parameter is required`);

    const tags = await this.getFilter(filter).then((t: ITag[]) => {
      if (t.length == 0)
        throw new Error(`tagRemoveFilter: filter query return 0 items`);

      return t;
    });
    return await Promise.all<IEntityRemove>(
      tags.map((tag: ITag) => {
        return this.remove(tag.id);
      })
    );
  }

  public async update(id: string, name: string) {
    if (!id) throw new Error(`tagUpdate: "id" parameter is required`);
    if (!name) throw new Error(`tagUpdate: "name" parameter is required`);

    let tag = await this.get(id).then((t) => t[0] as ITag);
    tag.name = name;
    tag.modifiedDate = modifiedDateTime();

    return await this.repoClient
      .Put(`tag/${id}`, { ...tag })
      .then((res) => res.data as ITag);
  }
}
