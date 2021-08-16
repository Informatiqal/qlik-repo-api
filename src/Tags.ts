import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { IEntityRemove, ISelection } from "./types/interfaces";
import { Tag, IClassTag } from "./Tag";

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

export interface IClassTags {
  get(id: string): Promise<IClassTag>;
  getAll(): Promise<IClassTag[]>;
  getFilter(filter: string, full?: boolean): Promise<IClassTag[]>;
  create(name: string): Promise<Tag>;
  createMany(name: string[]): Promise<Tag[]>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
}

export class Tags implements IClassTags {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    const tag: Tag = new Tag(this.repoClient, id);
    await tag.init();

    return tag;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`tag/full`)
      .then((res) => {
        return res.data as ITag[];
      })
      .then((data) => {
        return data.map((t) => new Tag(this.repoClient, t.id, t));
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`tag.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`tag?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ITag[])
      .then((data) => {
        return data.map((t) => new Tag(this.repoClient, t.id, t));
      });
  }

  public async create(name: string) {
    if (!name) throw new Error(`tag.create: "name" is required`);

    let createTag = await this.repoClient
      .Post(`tag`, { name })
      .then((res) => res.data as ITag);

    return new Tag(this.repoClient, createTag.id, createTag);
  }

  public async createMany(names: string[]) {
    if (!names || names.length == 0)
      throw new Error(`tag.createMany: "names" parameter is required`);

    const data = names.map((n) => {
      return { name: n };
    });

    return await this.repoClient
      .Post(`tag/many`, data)
      .then((res) => res.data as ITag[])
      .then((tags) => tags.map((t) => new Tag(this.repoClient, t.id, t)));
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(`tag.removeFilter: "filter" parameter is required`);

    const tags = await this.getFilter(filter);
    if (tags.length == 0)
      throw new Error(`tag.removeFilter: filter query return 0 items`);

    return await Promise.all<IEntityRemove>(
      tags.map((tag: IClassTag) =>
        tag.remove().then((s) => ({ id: tag.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/tag`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
