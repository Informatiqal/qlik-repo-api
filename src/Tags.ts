import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { IEntityRemove, ISelection, ITag } from "./types/interfaces";
import { Tag, IClassTag } from "./Tag";

export interface IClassTags {
  get(arg: { id: string }): Promise<IClassTag>;
  getAll(): Promise<IClassTag[]>;
  getFilter(arg: { filter: string; full?: boolean }): Promise<IClassTag[]>;
  create(arg: { name: string }): Promise<Tag>;
  createMany(arg: { names: string[] }): Promise<Tag[]>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class Tags implements IClassTags {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    const tag: Tag = new Tag(this.#repoClient, arg.id);
    await tag.init();

    return tag;
  }

  public async getAll() {
    return await this.#repoClient
      .Get(`tag/full`)
      .then((res) => {
        return res.data as ITag[];
      })
      .then((data) => {
        return data.map((t) => new Tag(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`tag.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get(`tag?filter=(${encodeURIComponent(arg.filter)})`)
      .then((res) => res.data as ITag[])
      .then((data) => {
        return data.map((t) => new Tag(this.#repoClient, t.id, t));
      });
  }

  public async create(arg: { name: string }) {
    if (!arg.name) throw new Error(`tag.create: "name" is required`);

    return await this.#repoClient
      .Post(`tag`, { name: arg.name })
      .then((res) => res.data as ITag)
      .then((t) => new Tag(this.#repoClient, t.id, t));
  }

  public async createMany(arg: { names: string[] }) {
    if (!arg.names || arg.names.length == 0)
      throw new Error(`tag.createMany: "names" parameter is required`);

    const data = arg.names.map((n) => {
      return { name: n };
    });

    return await this.#repoClient
      .Post(`tag/many`, data)
      .then((res) => res.data as ITag[])
      .then((tags) => tags.map((t) => new Tag(this.#repoClient, t.id, t)));
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`tag.removeFilter: "filter" parameter is required`);

    const tags = await this.getFilter({ filter: arg.filter });
    if (tags.length == 0)
      throw new Error(`tag.removeFilter: filter query return 0 items`);

    return await Promise.all<IEntityRemove>(
      tags.map((tag: IClassTag) =>
        tag.remove().then((s) => ({ id: tag.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/tag`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
