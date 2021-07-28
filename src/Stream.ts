import { QlikRepositoryClient } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { GetCommonProperties } from "./util/GetCommonProps";

import { IHttpStatus, IEntityRemove, IOwner } from "./types/interfaces";
import { ICustomPropertyCondensed } from "./CustomProperty";
import { ITagCondensed } from "./Tag";

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
  update(arg: IStreamUpdate): Promise<IStream>;
}

export class Stream implements IClassStream {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`steamGet: "id" parameter is required`);
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
      throw new Error(`streamGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`stream/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IStream[]);
  }

  public async create(arg: IStreamCreate) {
    if (!arg.name)
      throw new Error(`streamCreate: "path" parameter is required`);

    let getCommonProps = new GetCommonProperties(
      this,
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
    if (!id) throw new Error(`streamRemove: "id" parameter is required`);
    return await this.repoClient.Delete(`stream/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async update(arg: IStreamUpdate) {
    if (!arg.id) throw new Error(`streamUpdate: "id" parameter is required`);

    let stream = await this.get(arg.id);

    if (arg.name) stream.name = arg.name;

    let updateCommon = new UpdateCommonProperties(this, stream, arg);
    stream = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`stream/${arg.id}`, { ...stream })
      .then((res) => res.data as IStream);
  }
}
