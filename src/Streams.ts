import { QlikRepositoryClient } from "qlik-rest-api";
import { GetCommonProperties } from "./util/GetCommonProps";
import { URLBuild } from "./util/generic";

import {
  IEntityRemove,
  ISelection,
  IStream,
  IStreamCreate,
} from "./types/interfaces";
// import { ICustomPropertyCondensed } from "./CustomProperties";
// import { ITagCondensed } from "./Tags";
// import { IOwner } from "./Users";
import { Stream } from "./Stream";

export interface IClassStreams {
  get(arg: { id: string }): Promise<Stream>;
  getAll(): Promise<Stream[]>;
  getFilter(arg: { filter: string }): Promise<Stream[]>;
  create(arg: IStreamCreate): Promise<Stream>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class Streams implements IClassStreams {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`steam.get: "id" parameter is required`);
    const stream: Stream = new Stream(this.#repoClient, arg.id);
    await stream.init();

    return stream;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IStream[]>(`stream/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new Stream(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`stream.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get<IStream[]>(`stream/full?filter=(${encodeURIComponent(arg.filter)})`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new Stream(this.#repoClient, t.id, t));
      });
  }

  public async create(arg: IStreamCreate) {
    if (!arg.name)
      throw new Error(`stream.create: "path" parameter is required`);

    const getCommonProps = new GetCommonProperties(
      this.#repoClient,
      arg.customProperties,
      arg.tags,
      arg.owner
    );

    let commonProps = await getCommonProps.getAll();

    return await this.#repoClient
      .Post<IStream>(`stream`, {
        name: arg.name,
        ...commonProps,
      })
      .then((res) => res.data)
      .then((s) => new Stream(this.#repoClient, s.id, s));
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`stream.removeFilter: "filter" parameter is required`);

    const streams = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      streams.map((stream) =>
        stream.remove().then((s) => ({ id: stream.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/stream`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }
}
