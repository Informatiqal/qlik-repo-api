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
  get(id: string): Promise<IClassApp>;
  getAll(): Promise<IClassApp[]>;
  getFilter(filter: string, orderBy?: string): Promise<IClassApp[]>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
  upload(
    name: string,
    file: Buffer,
    keepData?: boolean,
    excludeDataConnections?: boolean
  ): Promise<IClassApp>;
  uploadAndReplace(
    name: string,
    targetAppId: string,
    file: Buffer,
    keepData?: boolean
  ): Promise<IClassApp>;
}

export class Apps implements IClassApps {
  private repoClient: QlikRepositoryClient;
  private genericClient: QlikGenericRestClient;
  constructor(
    private mainRepoClient: QlikRepositoryClient,
    private mainGenericClient: QlikGenericRestClient
  ) {
    this.repoClient = mainRepoClient;
    this.genericClient = mainGenericClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`apps.get: "id" parameter is required`);
    const app: App = new App(this.repoClient, id, null, this.genericClient);
    await app.init();

    return app;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`app/full`)
      .then((res) => res.data as IApp[])
      .then((data) => {
        return data.map((t) => new App(this.repoClient, t.id, t));
      });
  }

  public async getFilter(filter: string, orderBy?: string) {
    if (!filter)
      throw new Error(`app.getFilter: "filter" parameter is required`);

    const urlBuild = new URLBuild(`app/full`);
    urlBuild.addParam("filter", filter);
    urlBuild.addParam("orderby", orderBy);

    return await this.repoClient
      .Get(urlBuild.getUrl())
      .then((res) => res.data as IApp[])
      .then((data) => {
        return data.map((t) => new App(this.repoClient, t.id, t));
      });
  }

  public async upload(
    name: string,
    file: Buffer,
    keepData?: boolean,
    excludeDataConnections?: boolean
  ) {
    if (!name) throw new Error(`app.upload: "name" parameter is required`);
    if (!file) throw new Error(`app.upload: "file" parameter is required`);

    const urlBuild = new URLBuild("app/upload");
    urlBuild.addParam("name", name);
    urlBuild.addParam("keepdata", keepData);
    urlBuild.addParam("excludeconnections", excludeDataConnections);

    return await this.repoClient
      .Post(urlBuild.getUrl(), file, "application/vnd.qlik.sense.app")
      .then((res) => new App(this.repoClient, (res.data as IApp).id));
  }

  public async uploadAndReplace(
    name: string,
    targetAppId: string,
    file: Buffer,
    keepData?: boolean
  ) {
    if (!name)
      throw new Error(`app.uploadAndReplace: "name" parameter is required`);
    if (!file)
      throw new Error(`app.uploadAndReplace: "file" parameter is required`);
    if (!targetAppId)
      throw new Error(
        `app.uploadAndReplace: "targetAppId" parameter is required`
      );

    const urlBuild = new URLBuild("app/upload/replace");
    urlBuild.addParam("name", name);
    urlBuild.addParam("keepdata", keepData);
    urlBuild.addParam("targetappid", targetAppId);

    return await this.repoClient
      .Post(urlBuild.getUrl(), file, "application/vnd.qlik.sense.app")
      .then((res) => new App(this.repoClient, (res.data as IApp).id));
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(`app.removeFilter: "filter" parameter is required`);

    const apps = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      apps.map((app: IClassApp) =>
        app.remove().then((s) => ({ id: app.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/app`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
