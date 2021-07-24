import { QlikRepoApi } from "./main";
import { URLBuild, uuid } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import {
  IApp,
  IAppCondensed,
  ISelection,
  IRemoveFilter,
  IHttpReturnRemove,
} from "./interfaces";
import { IAppUpdate } from "./interfaces/argument.interface";
import { IHttpReturn } from "qlik-rest-api";

export class App {
  constructor() {}

  public async appCopy(
    this: QlikRepoApi,
    id: string,
    name?: string,
    includeCustomProperties?: boolean
  ): Promise<IApp> {
    if (!id) throw new Error(`appCopy: "id" parameter is required`);

    const urlBuild = new URLBuild(`app/${id}/copy`);
    if (name) urlBuild.addParam("name", name);
    if (includeCustomProperties)
      urlBuild.addParam("includecustomproperties", includeCustomProperties);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as IApp);
  }

  public async appExport(
    this: QlikRepoApi,
    id: string,
    fileName?: string,
    skipData?: boolean
  ): Promise<Buffer> {
    if (!id) throw new Error(`appExport: "id" parameter is required`);

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

    return await this.genericRepoClient
      .Get(downloadPath)
      .then((r) => r.data as Buffer);
  }

  public async appGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<IApp[] | IAppCondensed[]> {
    let url = "app";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res) => {
      if (!id) return res.data as IAppCondensed[];

      return [res.data] as IApp[];
    });
  }

  public async appGetFilter(
    this: QlikRepoApi,
    filter: string,
    orderBy?: string
  ): Promise<IApp[]> {
    if (!filter)
      throw new Error(`appGetFilter: "filter" parameter is required`);

    const urlBuild = new URLBuild(`app/full`);
    urlBuild.addParam("filter", filter);
    urlBuild.addParam("orderby", orderBy);

    return await this.repoClient
      .Get(urlBuild.getUrl())
      .then((res) => res.data as IApp[]);
  }

  public async appUpload(
    this: QlikRepoApi,
    name: string,
    file: Buffer,
    keepData?: boolean,
    excludeDataConnections?: boolean
  ): Promise<IApp> {
    if (!name) throw new Error(`appUpload: "name" parameter is required`);
    if (!file) throw new Error(`appUpload: "file" parameter is required`);

    const urlBuild = new URLBuild("app/upload");
    urlBuild.addParam("name", name);
    urlBuild.addParam("keepdata", keepData);
    urlBuild.addParam("excludeconnections", excludeDataConnections);

    return await this.repoClient
      .Post(urlBuild.getUrl(), file, "application/vnd.qlik.sense.app")
      .then((res) => res.data as IApp);
  }

  public async appUploadReplace(
    this: QlikRepoApi,
    name: string,
    targetAppId: string,
    file: Buffer,
    keepData?: boolean
  ): Promise<IApp> {
    if (!name)
      throw new Error(`appUploadReplace: "name" parameter is required`);
    if (!file)
      throw new Error(`appUploadReplace: "file" parameter is required`);
    if (!targetAppId)
      throw new Error(`appUploadReplace: "targetAppId" parameter is required`);

    const urlBuild = new URLBuild("app/upload/replace");
    urlBuild.addParam("name", name);
    urlBuild.addParam("keepdata", keepData);
    urlBuild.addParam("targetappid", targetAppId);

    return await this.repoClient
      .Post(urlBuild.getUrl(), file, "application/vnd.qlik.sense.app")
      .then((res) => res.data as IApp);
  }

  public async appPublish(
    this: QlikRepoApi,
    id: string,
    stream: string,
    name?: string
  ): Promise<IApp> {
    if (!id) throw new Error(`appPublish: "id" parameter is required`);
    if (!stream) throw new Error(`appPublish: "stream" parameter is required`);

    let streamRes = await this.repoClient.Get(
      `stream?filter=(name eq '${stream}')`
    );

    if (streamRes.data.length == 0)
      throw new Error(`appPublish: Stream "${stream}" not found`);

    if (streamRes.data.length > 1)
      throw new Error(`appPublish: Multiple streams found "${stream}"`);

    const urlBuild = new URLBuild(`app/${id}/publish`);
    urlBuild.addParam("stream", streamRes.data[0].id);
    urlBuild.addParam("name", name);

    return await this.repoClient
      .Put(urlBuild.getUrl(), {})
      .then((res) => res.data as IApp);
  }

  public async appRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`appRemove: "id" parameter is required`);
    return await this.repoClient.Delete(`app/${id}`).then((res) => {
      return { id, status: res.status };
    });
  }

  public async appRemoveFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IRemoveFilter[]> {
    if (!filter)
      throw new Error(`appRemoveFilter: "filter" parameter is required`);

    const apps = await this.appGetFilter(filter);
    return Promise.all<IRemoveFilter>(
      apps.map((app: IApp) => {
        return this.repoClient
          .Delete(`app/${app.id}`)
          .then((res: IHttpReturn) => {
            return { id: app.id, status: res.status };
          });
      })
    );
  }

  public async appSelect(
    this: QlikRepoApi,
    filter?: string
  ): Promise<ISelection> {
    const urlBuild = new URLBuild(`selection/app`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async appSwitch(
    this: QlikRepoApi,
    sourceAppId: string,
    targetAppId: string
  ): Promise<IApp> {
    if (!sourceAppId)
      throw new Error(`appSwitch: "sourceAppId" parameter is required`);
    if (!targetAppId)
      throw new Error(`appSwitch: "targetAppId" parameter is required`);

    return await this.repoClient
      .Put(`app/${sourceAppId}/replace?app=${targetAppId}`, {})
      .then((res) => res.data as IApp);
  }

  public async appUpdate(this: QlikRepoApi, arg: IAppUpdate): Promise<IApp> {
    if (!arg.id) throw new Error(`appUpdate: "id" parameter is required`);

    let app = await this.appGet(arg.id).then((a) => a[0] as IApp);

    if (arg.name) app.name = arg.name;
    if (arg.description) app.description = arg.description;

    let updateCommon = new UpdateCommonProperties(this, app, arg);
    app = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`app/${arg.id}`, { ...app })
      .then((res) => res.data as IApp);
  }
}
