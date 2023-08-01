import { QlikRepositoryClient } from "qlik-rest-api";
import { IUpdateObjectOptions } from "./types/interfaces";
import { IStream, IStreamUpdate } from "./types/interfaces";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { zodStreamUpdate, zodUpdateObjectOptions } from "./types/ZodSchemas";
import { ArgValidationError } from "./util/CustomErrors";

export class Stream {
  #id: string;
  #repoClient: QlikRepositoryClient;
  /**
   * Contains all the details for the current entity
   */
  details: IStream;
  constructor(repoClient: QlikRepositoryClient, id: string, details?: IStream) {
    if (!id) throw new Error(`stream.get: "id" parameter is required`);

    this.details = {} as IStream;
    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  /**
   * Get the stream details from Qlik (this method is called internally and
   * usually there is no need to be called)
   *
   * Use "force" parameter to force the method to update the data (if needed)
   */
  async init(arg?: { force?: boolean }) {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IStream>(`stream/${this.#id}`)
        .then((res) => res.data);
    }

    if (arg && arg.force && arg.force == true) {
      this.details = await this.#repoClient
        .Get<IStream>(`stream/${this.#id}`)
        .then((res) => res.data);
    }
  }

  /**
   * Delete the current stream
   */
  public async remove() {
    return await this.#repoClient
      .Delete(`stream/${this.#id}`)
      .then((res) => res.status);
  }

  /**
   * Update the current stream
   */
  public async update(arg: IStreamUpdate, options?: IUpdateObjectOptions) {
    const argParse = zodStreamUpdate.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("stream.update", argParse.error.issues);

    // if options are provided then validate them as well
    if (options) {
      const optionsParse = zodUpdateObjectOptions.safeParse(options);
      if (!optionsParse.success)
        throw new ArgValidationError(
          "stream.update",
          optionsParse.error.issues
        );
    }

    if (arg.name) this.details.name = arg.name;

    const updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put<IStream>(`stream/${this.details.id}`, { ...this.details })
      .then(() => this.init())
      .then(() => this.details);
  }
}
