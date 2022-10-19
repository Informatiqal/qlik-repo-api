import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { IExtension, IExtensionImport, ISelection } from "./types/interfaces";
import { Extension } from "./Extension";

import { IEntityRemove } from "./types/interfaces";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassExtensions {
  get(arg: { id: string }): Promise<Extension>;
  getAll(): Promise<Extension[]>;
  getFilter(arg: { filter: string; full?: boolean }): Promise<Extension[]>;
  import(arg: IExtensionImport): Promise<Extension>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class Extensions implements IClassExtensions {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`extension.get: "id" parameter is required`);
    const extension: Extension = new Extension(this.#repoClient, arg.id, null);
    await extension.init();

    return extension;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IExtension[]>(`extension/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new Extension(this.#repoClient, t.id, t));
      });
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`extension.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get<IExtension[]>(`extension?filter=(${encodeURIComponent(arg.filter)})`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new Extension(this.#repoClient, t.id, t));
      });
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `extensions.removeFilter: "filter" parameter is required`
      );

    const extensions = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      extensions.map((extension) =>
        extension
          .remove()
          .then((s) => ({ id: extension.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/extension`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }

  public async import(arg: IExtensionImport) {
    if (!arg.file)
      throw new Error(`extension.import: "file" parameter is required`);

    const urlBuild = new URLBuild(`extension/upload`);
    if (arg.password) urlBuild.addParam("password", arg.password);

    return await this.#repoClient
      .Post<IExtension>(urlBuild.getUrl(), arg.file)
      .then((res) => {
        return new Extension(this.#repoClient, res.data[0].id, res.data[0]);
      })
      .then(async (extension) => {
        if (arg.customProperties || arg.tags || arg.owner) {
          let props: {
            customProperties?: string[];
            tags?: string[];
            owner?: string;
          } = {};

          if (arg.customProperties)
            props.customProperties = arg.customProperties;
          if (arg.tags) props.tags = arg.tags;
          if (arg.owner) props.owner = arg.owner;

          const updateCommon = new UpdateCommonProperties(
            this.#repoClient,
            extension.details,
            props
          );

          extension.details = await updateCommon.updateAll();

          extension.details = await this.#repoClient
            .Put<IExtension>(`extension/${extension.details.id}`, {
              ...extension.details,
            })
            .then((res) => res.data);
        }
        return extension;
      })
      .catch((e) => {
        if (e.message == "Request failed with status code 400")
          throw new Error(
            "extensions.import: Status code 400. Possibly extension with the same name already exists."
          );

        throw new Error(e.message);
      });
  }
}
