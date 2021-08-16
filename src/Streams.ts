import { QlikRepositoryClient } from "qlik-rest-api";
import { GetCommonProperties } from "./util/GetCommonProps";
import { URLBuild } from "./util/generic";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { ICustomPropertyCondensed } from "./CustomProperties";
import { ITagCondensed } from "./Tags";
import { IOwner } from "./Users";
import { IClassStream, Stream } from "./Stream";

export interface IStreamCreate {
  name: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export interface IStreamUpdate {
  // id: string;
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

export interface IClassStreams {
  get(id: string): Promise<IClassStream>;
  getAll(): Promise<IClassStream[]>;
  getFilter(filter: string): Promise<IClassStream[]>;
  create(name: IStreamCreate): Promise<IClassStream>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
}

export class Streams implements IClassStreams {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`steam.get: "id" parameter is required`);
    const stream: Stream = new Stream(this.repoClient, id);
    await stream.init();

    return stream;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`stream/full`)
      .then((res) => res.data as IStream[])
      .then((data) => {
        return data.map((t) => new Stream(this.repoClient, t.id, t));
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`stream.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`stream/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IStream[])
      .then((data) => {
        return data.map((t) => new Stream(this.repoClient, t.id, t));
      });
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
      .then((res) => res.data as IStream)
      .then((s) => new Stream(this.repoClient, s.id, s));
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(`stream.removeFilter: "filter" parameter is required`);

    const streams = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      streams.map((stream: IClassStream) =>
        stream.remove().then((s) => ({ id: stream.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/stream`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
