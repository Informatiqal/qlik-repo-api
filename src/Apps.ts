import { info } from "console";
import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import {
  ISelection,
  IEntityRemove,
  IApp,
  IAppUpload,
  IAppUpdate,
  IAppUploadAndReplace,
} from "./types/interfaces";
import { App } from "./App";
import { IncomingMessage } from "http";
import { ReadStream } from "fs";

export interface IClassApps {
  /**
   * Get single app instance
   */
  get(arg: { id: string }): Promise<App>;
  /**
   * Get all available apps instance for a user
   */
  getAll(): Promise<App[]>;
  /**
   * Get array of apps instance based on the supplied filter
   */
  getFilter(arg: { filter: string; orderBy?: string }): Promise<App[]>;
  /**
   * Remove apps based on the supplied filter
   */
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  /**
   * Create selection based on the supplied filter
   */
  select(arg?: { filter: string }): Promise<ISelection>;
  /**
   * Upload an qvf
   */
  upload(arg: {
    name: string;
    file: Buffer;
    keepData?: boolean;
    excludeDataConnections?: boolean;
  }): Promise<App>;
  /**
   * Upload multiple apps in a single method
   */
  uploadMany(arg: {
    apps: [
      {
        name: string;
        file: Buffer;
        keepData?: boolean;
        excludeDataConnections?: boolean;
      }
    ];
    sequence?: Boolean;
  }): Promise<App[]>;
  /**
   * EXPERIMENTAL
   *
   * Upload an qvf and replace an existing app with it
   */
  uploadAndReplace(arg: {
    name: string;
    targetAppId: string;
    file: Buffer;
    keepData?: boolean;
  }): Promise<App>;
  /**
   * Export multiple qvf to Buffer
   */
  exportMany(arg?: {
    filter: string;
    skipData?: boolean;
  }): Promise<{ file: IncomingMessage; exportToken: string; name: string }[]>;
}

export class Apps implements IClassApps {
  #repoClient: QlikRepositoryClient;
  #genericClient: QlikGenericRestClient;
  #genericClientWithPort?: QlikGenericRestClient;
  constructor(
    mainRepoClient: QlikRepositoryClient,
    mainGenericClient: QlikGenericRestClient,
    mainGenericClientWithPort?: QlikGenericRestClient
  ) {
    this.#repoClient = mainRepoClient;
    this.#genericClient = mainGenericClient;
    this.#genericClientWithPort = mainGenericClientWithPort;
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`apps.get: "id" parameter is required`);
    const app: App = new App(
      this.#repoClient,
      arg.id,
      null,
      this.#genericClient,
      this.#genericClientWithPort
    );
    await app.init();

    return app;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<IApp[]>(`app/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map(
          (t) =>
            new App(
              this.#repoClient,
              t.id,
              t,
              this.#genericClient,
              this.#genericClientWithPort
            )
        );
      });
  }

  public async getFilter(arg: { filter: string; orderBy?: string }) {
    if (!arg.filter)
      throw new Error(`app.getFilter: "filter" parameter is required`);

    const urlBuild = new URLBuild(`app/full`);
    urlBuild.addParam("filter", arg.filter);
    urlBuild.addParam("orderby", arg.orderBy);

    return await this.#repoClient
      .Get<IApp[]>(urlBuild.getUrl())
      .then((res) => res.data)
      .then((apps) => {
        return apps.map(
          (app) =>
            new App(
              this.#repoClient,
              app.id,
              app,
              this.#genericClient,
              this.#genericClientWithPort
            )
        );
      });
  }

  public async exportMany(arg: { filter: string; skipData?: boolean }) {
    if (!arg.filter)
      throw new Error(`app.exportMany: "filter" parameter is required`);

    const apps = await this.getFilter(arg);

    return await Promise.all(
      apps.map((a) => a.export({ skipData: arg.skipData || false }))
    );
  }

  public async upload(arg: IAppUpload) {
    if (!arg.name) throw new Error(`app.upload: "name" parameter is required`);
    if (!arg.file) throw new Error(`app.upload: "file" parameter is required`);

    const urlBuild = new URLBuild("app/upload");
    urlBuild.addParam("name", arg.name);
    urlBuild.addParam("keepdata", arg.keepData);
    urlBuild.addParam("excludeconnections", arg.excludeDataConnections);

    // (arg.file as IncomingMessage).on("data", function () {
    //   //
    //   // info("Uploading");
    //   info("Uploading");
    // });

    const app = await this.#repoClient
      .Post<IApp>(urlBuild.getUrl(), arg.file, "application/vnd.qlik.sense.app")
      .then(
        (res) =>
          new App(
            this.#repoClient,
            res.data.id,
            res.data,
            this.#genericClient,
            this.#genericClientWithPort
          )
      );

    if (arg.customProperties || arg.tags) {
      const options: IAppUpdate = {};
      if (arg.customProperties) options.customProperties = arg.customProperties;
      if (arg.tags) options.tags = arg.tags;

      await app.update({ ...options });
    }

    return app;
  }

  public async uploadMany(arg: {
    apps: [
      {
        name: string;
        file: Buffer | ReadStream | IncomingMessage | WritableStream;
        keepData?: boolean;
        excludeDataConnections?: boolean;
      }
    ];
    sequence?: Boolean;
  }): Promise<App[]> {
    return await Promise.all(
      arg.apps.map((a) => {
        return this.upload(a);
      })
    );
  }

  public async uploadAndReplace(arg: IAppUploadAndReplace) {
    if (!arg.name)
      throw new Error(`app.uploadAndReplace: "name" parameter is required`);
    if (!arg.file)
      throw new Error(`app.uploadAndReplace: "file" parameter is required`);
    if (!arg.targetAppId)
      throw new Error(
        `app.uploadAndReplace: "targetAppId" parameter is required`
      );

    const urlBuild = new URLBuild("app/upload/replace");
    urlBuild.addParam("name", arg.name);
    urlBuild.addParam("keepdata", arg.keepData);
    urlBuild.addParam("targetappid", arg.targetAppId);

    const app = await this.#repoClient
      .Post<IApp>(urlBuild.getUrl(), arg.file, "application/vnd.qlik.sense.app")
      .then(
        (res) =>
          new App(
            this.#repoClient,
            res.data.id,
            null,
            this.#genericClient,
            this.#genericClientWithPort
          )
      );

    if (arg.customProperties || arg.tags) {
      const options: IAppUpdate = {};
      if (arg.customProperties) options.customProperties = arg.customProperties;
      if (arg.tags) options.tags = arg.tags;

      await app.update({ ...options });
    }

    return app;
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`app.removeFilter: "filter" parameter is required`);

    const apps = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      apps.map((app: App) =>
        app.remove().then((s) => ({ id: app.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/app`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }
}
