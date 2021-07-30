import { QlikRepositoryClient } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { GetCommonProperties } from "./util/GetCommonProps";
import { URLBuild } from "./util/generic";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { ICustomPropertyCondensed } from "./CustomProperty";
import { ITagCondensed } from "./Tag";
import { IOwner } from "./User";
export interface IStreamCreate {
  name: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IStreamUpdate {
  id: string;
  name?: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IStreamCondensed {
  id: string;
  name: string;
  privileges: [];
}

export interface IStream extends IStreamCondensed {
  createdDate: string;
  modifiedDate: string;
  modifiedByUserName?: string;
  schemaPath: string;
  customProperties: ICustomPropertyCondensed[];
  owner: IOwner;
  tags: ITagCondensed[];
}

export interface IClassStream {
  get(id: string): Promise<IStream>;
  getAll(): Promise<IStreamCondensed[]>;
  getFilter(filter: string): Promise<IStream[]>;
  create(name: IStreamCreate): Promise<IStream>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
  update(arg: IStreamUpdate): Promise<IStream>;
}

export class Stream implements IClassStream {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`steam.get: "id" parameter is required`);
    return await this.repoClient
      .Get(`stream/${id}`)
      .then((res) => res.data as IStream);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`stream`)
      .then((res) => res.data as IStreamCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`stream.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`stream/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IStream[]);
  }

  public async create(arg: IStreamCreate) {
    if (!arg.name)
      throw new Error(`stream.create: "path" parameter is required`);

    let getCommonProps = new GetCommonProperties(
      this.repoClient,
      arg.customProperties,
      arg.tags,
      arg.owner
    );

    let commonProps = await getCommonProps.getAll();

    return await this.repoClient
      .Post(`stream`, {
        name: arg.name,
        ...commonProps,
      })
      .then((res) => res.data as IStream);
  }

  public async remove(id: string) {
    if (!id) throw new Error(`stream.remove: "id" parameter is required`);
    return await this.repoClient.Delete(`stream/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(`stream.removeFilter: "filter" parameter is required`);

    const tags = await this.getFilter(filter).then((t: IStream[]) => {
      if (t.length == 0)
        throw new Error(`stream.removeFilter: filter query return 0 items`);

      return t;
    });
    return await Promise.all<IEntityRemove>(
      tags.map((tag: IStream) => {
        return this.remove(tag.id);
      })
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/stream`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async update(arg: IStreamUpdate) {
    if (!arg.id) throw new Error(`stream.update: "id" parameter is required`);

    let stream = await this.get(arg.id);

    if (arg.name) stream.name = arg.name;

    let updateCommon = new UpdateCommonProperties(this.repoClient, stream, arg);
    stream = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`stream/${arg.id}`, { ...stream })
      .then((res) => res.data as IStream);
  }
}
