import { QlikRepositoryClient } from "qlik-rest-api";
import { GetCommonProperties } from "./util/GetCommonProps";
import { URLBuild } from "./util/generic";
import { Stream } from "./Stream";
import { ArgValidationError } from "./util/CustomErrors";

import {
  zodGetByFilterSchema,
  zodGetByIdSchema,
  zodStreamCreate,
} from "./types/ZodSchemas";
import {
  IEntityRemove,
  ISelection,
  IStream,
  IStreamCreate,
} from "./types/interfaces";

export class Streams {
  #repoClient: QlikRepositoryClient;
  constructor(mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  /**
   * Get stream instance by providing an ID
   */
  public async get(arg: { id: string }) {
    const argParse = zodGetByIdSchema.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("streams.get", argParse.error.issues);

    if (!arg.id) throw new Error(`steam.get: "id" parameter is required`);
    const stream: Stream = new Stream(this.#repoClient, arg.id);
    await stream.init();

    return stream;
  }

  /**
   * Get all streams
   */
  public async getAll() {
    return await this.#repoClient
      .Get<IStream[]>(`stream/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new Stream(this.#repoClient, t.id, t));
      });
  }

  /**
   * Get stream instances from the specified filter
   */
  public async getFilter(arg: { filter: string }) {
    const argParse = zodGetByFilterSchema.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("streams.getFilter", argParse.error.issues);

    if (!arg.filter)
      throw new Error(`stream.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get<IStream[]>(`stream/full?filter=(${encodeURIComponent(arg.filter)})`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new Stream(this.#repoClient, t.id, t));
      });
  }

  /**
   * Create new stream
   */
  public async create(arg: IStreamCreate) {
    const argParse = zodStreamCreate.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("streams.create", argParse.error.issues);

    if (!arg.name)
      throw new Error(`stream.create: "path" parameter is required`);

    const getCommonProps = new GetCommonProperties(
      this.#repoClient,
      arg.customProperties ?? [],
      arg.tags ?? [],
      arg.owner ?? ""
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

  /**
   * Search for streams from the provided filter and remove them
   */
  public async removeFilter(arg: { filter: string }) {
    const argParse = zodGetByIdSchema.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError(
        "streams.removeFilter",
        argParse.error.issues
      );

    if (!arg.filter)
      throw new Error(`stream.removeFilter: "filter" parameter is required`);

    const streams = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      streams.map((stream) =>
        stream.remove().then((s) => ({ id: stream.details.id, status: s }))
      )
    );
  }

  /**
   * Select streams from the provided filter
   */
  public async select(arg?: { filter: string }) {
    const argParse = zodGetByIdSchema.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("streams.select", argParse.error.issues);

    const urlBuild = new URLBuild(`selection/stream`);
    urlBuild.addParam("filter", arg?.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }
}
