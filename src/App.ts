import { QlikGenericRestClient, QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild, uuid } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { ITagCondensed } from "./Tag";
import {
  ISelection,
  IEntityRemove,
  IOwner,
  ICustomPropertyObject,
} from "./types/interfaces";

import { IStream } from "./Stream";

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
  customProperties: ICustomPropertyObject[];
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

export interface IAppUpdate {
  id: string;
  name?: string;
  description?: string;
  tags?: string[];
  /**
   * In format `["cpName=value1", "cpName=value2", "otherCpName=value123", ...]`
   */
  customProperties?: string[];
  /**
   * In format `USER_DIRECTORY/USER_ID`
   */
  owner?: string;
  stream?: string;
}
export interface IClassApp {
  copy(id: string): Promise<IApp>;
  export(id: string): Promise<Buffer>;
  get(id: string): Promise<IApp>;
  getAll(): Promise<IAppCondensed[]>;
  getFilter(filter: string, orderBy?: string): Promise<IApp[]>;
  publish(id: string, stream: string, name?: string): Promise<IApp>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
  switch(sourceAppId: string, targetAppId: string): Promise<IApp>;
  update(arg: IAppUpdate): Promise<IApp>;
  upload(
    name: string,
    file: Buffer,
    keepData?: boolean,
    excludeDataConnections?: boolean
  ): Promise<IApp>;
  uploadAndReplace(
    name: string,
    targetAppId: string,
    file: Buffer,
    keepData?: boolean
  ): Promise<IApp>;
}

export class App implements IClassApp {
  private repoClient: QlikRepositoryClient;
  private genericClient: QlikGenericRestClient;
  constructor(
    private mainRepoClient: QlikRepositoryClient,
    private mainGenericClient: QlikGenericRestClient
  ) {
    this.repoClient = mainRepoClient;
    this.genericClient = mainGenericClient;
  }

  public async copy(
    id: string,
    name?: string,
    includeCustomProperties?: boolean
  ) {
    if (!id) throw new Error(`app.copy: "id" parameter is required`);

    const urlBuild = new URLBuild(`app/${id}/copy`);
    if (name) urlBuild.addParam("name", name);
    if (includeCustomProperties)
      urlBuild.addParam("includecustomproperties", includeCustomProperties);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as IApp);
  }

  public async export(id: string, fileName?: string, skipData?: boolean) {
    if (!id) throw new Error(`app.export: "id" parameter is required`);

    const token = uuid();
    const urlBuild = new URLBuild(`app/${id}/export/${token}`);
    if (!fileName) fileName = `${id}.qvf`;

    urlBuild.addParam("skipdata", skipData);

    const downloadPath: string = await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((response) => response.data)
      .then((data) => {
        return data.downloadPath.replace("/tempcontent", "tempcontent");
      });

    return await this.genericClient
      .Get(downloadPath)
      .then((r) => r.data as Buffer);
  }

  public async get(id: string) {
    if (!id) throw new Error(`app.get: "id" parameter is required`);
    return await this.repoClient
      .Get(`app/${id}`)
      .then((res) => res.data as IApp);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`app`)
      .then((res) => res.data as IAppCondensed[]);
  }

  public async getFilter(filter: string, orderBy?: string) {
    if (!filter)
      throw new Error(`app.getFilter: "filter" parameter is required`);

    const urlBuild = new URLBuild(`app/full`);
    urlBuild.addParam("filter", filter);
    urlBuild.addParam("orderby", orderBy);

    return await this.repoClient
      .Get(urlBuild.getUrl())
      .then((res) => res.data as IApp[]);
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
      .then((res) => res.data as IApp);
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
      .then((res) => res.data as IApp);
  }

  public async publish(id: string, stream: string, name?: string) {
    if (!id) throw new Error(`app.publish: "id" parameter is required`);
    if (!stream) throw new Error(`app.publish: "stream" parameter is required`);

    let streamRes = await this.repoClient.Get(
      `stream?filter=(name eq '${stream}')`
    );

    if (streamRes.data.length == 0)
      throw new Error(`app.publish: Stream "${stream}" not found`);

    if (streamRes.data.length > 1)
      throw new Error(`app.publish: Multiple streams found "${stream}"`);

    const urlBuild = new URLBuild(`app/${id}/publish`);
    urlBuild.addParam("stream", streamRes.data[0].id);
    urlBuild.addParam("name", name);

    return await this.repoClient
      .Put(urlBuild.getUrl(), {})
      .then((res) => res.data as IApp);
  }

  public async remove(id: string) {
    if (!id) throw new Error(`app.remove: "id" parameter is required`);
    return await this.repoClient.Delete(`app/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(`app.removeFilter: "filter" parameter is required`);

    const apps = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      apps.map((app: IApp) => {
        return this.remove(app.id);
      })
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/app`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async switch(sourceAppId: string, targetAppId: string) {
    if (!sourceAppId)
      throw new Error(`app.switch: "sourceAppId" parameter is required`);
    if (!targetAppId)
      throw new Error(`app.switch: "targetAppId" parameter is required`);

    return await this.repoClient
      .Put(`app/${sourceAppId}/replace?app=${targetAppId}`, {})
      .then((res) => res.data as IApp);
  }

  public async update(arg: IAppUpdate) {
    if (!arg.id) throw new Error(`app.update: "id" parameter is required`);

    let app = await this.get(arg.id);

    if (arg.name) app.name = arg.name;
    if (arg.description) app.description = arg.description;

    let updateCommon = new UpdateCommonProperties(this, app, arg);
    app = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`app/${arg.id}`, { ...app })
      .then((res) => res.data as IApp);
  }
}
