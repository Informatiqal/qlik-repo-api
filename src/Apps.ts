import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";

import { ITagCondensed } from "./Tags";
import { ISelection, IEntityRemove, IHttpStatus } from "./types/interfaces";

import { App, IClassApp } from "./App";
import { ICustomPropertyValue } from "./CustomProperties";
import { IStream } from "./Streams";
import { IOwner } from "./Users";

export interface IAppCondensed {
  appId: string;
  availabilityStatus: {};
  id?: string;
  migrationHash: string;
  name: string;
  privileges?: string[];
  published: boolean;
  publishTime: string;
  savedInProductVersion: string;
  stream: IStream;
}

export interface IApp extends IAppCondensed {
  createdDate: string;
  customProperties: ICustomPropertyValue[];
  description: string;
  dynamicColor: string;
  fileSize: number;
  lastReloadTime: string;
  modifiedDate: string;
  owner: IOwner;
  schemaPath: string;
  sourceAppId: string;
  tags: ITagCondensed[];
  targetAppId: string;
  thumbnail: string;
}

export interface IClassApps {
  get(arg: { id: string }): Promise<IClassApp>;
  getAll(): Promise<IClassApp[]>;
  getFilter(arg: { filter: string; orderBy?: string }): Promise<IClassApp[]>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
  upload(arg: {
    name: string;
    file: Buffer;
    keepData?: boolean;
    excludeDataConnections?: boolean;
  }): Promise<IClassApp>;
  uploadAndReplace(arg: {
    name: string;
    targetAppId: string;
    file: Buffer;
    keepData?: boolean;
  }): Promise<IClassApp>;
  exportMany(arg?: {
    filter: string;
    skipData?: boolean;
  }): Promise<{ file: Buffer; exportToken: string; name: string }[]>;
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
      .Get(`app/full`)
      .then((res) => res.data as IApp[])
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
      .Get(urlBuild.getUrl())
      .then((res) => res.data as IApp[])
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

  public async upload(arg: {
    name: string;
    file: Buffer;
    keepData?: boolean;
    excludeDataConnections?: boolean;
  }) {
    if (!arg.name) throw new Error(`app.upload: "name" parameter is required`);
    if (!arg.file) throw new Error(`app.upload: "file" parameter is required`);

    const urlBuild = new URLBuild("app/upload");
    urlBuild.addParam("name", arg.name);
    urlBuild.addParam("keepdata", arg.keepData);
    urlBuild.addParam("excludeconnections", arg.excludeDataConnections);

    return await this.#repoClient
      .Post(urlBuild.getUrl(), arg.file, "application/vnd.qlik.sense.app")
      .then(
        (res) =>
          new App(
            this.#repoClient,
            (res.data as IApp).id,
            res.data,
            this.#genericClient,
            this.#genericClientWithPort
          )
      );
  }

  public async uploadAndReplace(arg: {
    name: string;
    targetAppId: string;
    file: Buffer;
    keepData?: boolean;
  }) {
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

    return await this.#repoClient
      .Post(urlBuild.getUrl(), arg.file, "application/vnd.qlik.sense.app")
      .then(
        (res) =>
          new App(
            this.#repoClient,
            (res.data as IApp).id,
            null,
            this.#genericClient,
            this.#genericClientWithPort
          )
      );
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`app.removeFilter: "filter" parameter is required`);

    const apps = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      apps.map((app: IClassApp) =>
        app.remove().then((s) => ({ id: app.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/app`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
