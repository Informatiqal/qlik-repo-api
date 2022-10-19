import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { GetCommonProperties } from "./util/GetCommonProps";

import {
  ISharedContent,
  IEntityRemove,
  ISelection,
  ISharedContentCreate,
} from "./types/interfaces";

import { SharedContent } from "./SharedContent";

export interface IClassSharedContents {
  get(arg: { id: string }): Promise<SharedContent>;
  getAll(): Promise<SharedContent[]>;
  getFilter(arg: { filter: string }): Promise<SharedContent[]>;
  create(arg: ISharedContentCreate): Promise<SharedContent>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class SharedContents implements IClassSharedContents {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id)
      throw new Error(`sharedContent.get: "id" parameter is required`);
    const shc: SharedContent = new SharedContent(this.#repoClient, arg.id);
    await shc.init();

    return shc;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<ISharedContent[]>(`sharedcontent/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new SharedContent(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `sharedContent.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get<ISharedContent[]>(
        `sharedcontent/full?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new SharedContent(this.#repoClient, t.id, t));
      });
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `sharedContent.removeFilter: "filter" parameter is required`
      );

    const shc = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      shc.map((sc) =>
        sc.remove().then((s) => ({ id: sc.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/sharedcontent`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async create(arg: ISharedContentCreate) {
    if (!arg.name)
      throw new Error(`sharedContent.create: "name" parameter is required`);
    if (!arg.type)
      throw new Error(`sharedContent.create: "type" parameter is required`);

    let sharedContent: { [k: string]: any } = {};

    sharedContent["name"] = arg.name;
    sharedContent["type"] = arg.type;

    if (arg.description) sharedContent["description"] = arg.description;

    const getCommon = new GetCommonProperties(
      this.#repoClient,
      arg.customProperties || [],
      arg.tags || [],
      ""
    );
    const commonProps = await getCommon.getAll();

    return await this.#repoClient
      .Post<ISharedContent>(`sharedcontent`, {
        ...sharedContent,
        ...commonProps,
      })
      .then((res) => res.data)
      .then((s) => new SharedContent(this.#repoClient, s.id, s));
  }
}
