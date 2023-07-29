import { QlikRepositoryClient } from "qlik-rest-api";
import {
  ICustomBannerCreate,
  ICustomBannerMessage,
  TAddRemoveSet,
} from "./types/interfaces";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export class CustomBannerMessage {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: ICustomBannerMessage;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: ICustomBannerMessage
  ) {
    if (!id)
      throw new Error(`customBannerMessage.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<ICustomBannerMessage>(`custombannermessage/${this.#id}/full`)
        .then((res) => res.data);
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`custombannermessage/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(
    arg: Partial<ICustomBannerCreate>,
    options?: {
      tagOperation?: TAddRemoveSet;
    }
  ): Promise<number> {
    if (!arg)
      throw new Error(`customBannerMessage.update: parameter is required`);
    if (arg.name) this.details.name = arg.name;
    if (arg.message) this.details.message = arg.message;
    if (arg.messageType) this.details.messageType = arg.messageType;
    if (arg.isActive) this.details.isActive = arg.isActive;
    if (arg.duration) this.details.duration = arg.duration;

    const updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put<ICustomBannerMessage>(
        `custombannermessage/${this.#id}`,
        this.details
      )
      .then((res) => res.status);
  }
}
