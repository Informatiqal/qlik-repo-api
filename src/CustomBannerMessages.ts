import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import {
  ICustomBannerCreate,
  ICustomBannerMessage,
  IEntityRemove,
  ISelection,
} from "./types/interfaces";
import { CustomBannerMessage } from "./CustomBannerMessage";

export class CustomBannerMessages {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    const banner: CustomBannerMessage = new CustomBannerMessage(
      this.#repoClient,
      arg.id
    );
    await banner.init();

    return banner;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<ICustomBannerMessage[]>(`custombannermessage/full`)
      .then((res) => {
        return res.data.map(
          (t) => new CustomBannerMessage(this.#repoClient, t.id, t)
        );
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `customBannerMessage.getFilter: "filter" parameter is required`
      );

    return await this.#repoClient
      .Get<ICustomBannerMessage[]>(
        `custombannermessage?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map(
          (t) => new CustomBannerMessage(this.#repoClient, t.id, t)
        );
      });
  }

  public async create(arg: ICustomBannerCreate) {
    if (!arg.name)
      throw new Error(`customBannerMessage.create: "name" is required`);
    if (!arg.message)
      throw new Error(`customBannerMessage.create: "message" is required`);
    if (!arg.messageType)
      throw new Error(`customBannerMessage.create: "messageType" is required`);
    if (!arg.isActive)
      throw new Error(`customBannerMessage.create: "isActive" is required`);
    if (!arg.duration)
      throw new Error(`customBannerMessage.create: "duration" is required`);

    return await this.#repoClient
      .Post<ICustomBannerMessage>(`custombannermessage`, { name: arg.name })
      .then(
        (res) =>
          new CustomBannerMessage(this.#repoClient, res.data.id, res.data)
      );
  }

  public async createMany(
    arg: ICustomBannerCreate[]
  ): Promise<CustomBannerMessage[]> {
    if (arg.length == 0)
      throw new Error(
        `custombannermessage.createMany: provide data for at least one custom banner message`
      );

    return await Promise.all(arg.map((a) => this.create(a)));
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `customBannerMessage.removeFilter: "filter" parameter is required`
      );

    const customBannerMessages = await this.getFilter({ filter: arg.filter });
    if (customBannerMessages.length == 0)
      throw new Error(
        `customBannerMessage.removeFilter: filter query return 0 items`
      );

    return await Promise.all<IEntityRemove>(
      customBannerMessages.map((message) =>
        message.remove().then((s) => ({ id: message.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/3`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async count(arg?: { filter: string }): Promise<number> {
    const urlBuild = new URLBuild(`custombannermessage/count`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient.Get<number>(urlBuild.getUrl()).then((res) => {
      return res.data;
    });
  }
}
