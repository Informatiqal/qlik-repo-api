import { QlikRepoApi } from "./main";
import { URLBuild, isGUID, uuid } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import {
  IApp,
  IHttpStatus,
  IAppExportResponse,
  IRemoveFilter,
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
    const urlBuild = new URLBuild(`app/${id}`);
    if (name) urlBuild.addParam("name", name);
    if (includeCustomProperties)
      urlBuild.addParam("includecustomproperties", includeCustomProperties);

    return await this.repoClient
      .Get(urlBuild.getUrl())
      .then((res) => res.data as IApp);
  }

  public async appRemove(this: QlikRepoApi, id: string): Promise<IHttpStatus> {
    return await this.repoClient
      .Delete(`app/${id}`)
      .then((res) => res.status as IHttpStatus);
  }

  public async appRemoveFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IRemoveFilter[]> {
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

  public async appExport(
    this: QlikRepoApi,
    id: string,
    fileName?: string,
    skipData?: boolean
  ): Promise<string> {
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

    const file = await this.genericClient.Get(downloadPath);

    return "";
  }

  public async appGet(this: QlikRepoApi, id: string): Promise<IApp> {
    return await this.repoClient
      .Get(`app/${id}`)
      .then((res) => res.data as IApp);
  }

  public async appGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IApp[]> {
    return await this.repoClient
      .Get(`app?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IApp[]);
  }

  public async appImport(
    this: QlikRepoApi,
    name: string,
    file: Buffer,
    upload?: true,
    keepData?: boolean,
    excludeDataConnections?: boolean
  ): Promise<IApp> {
    const urlBuild = upload
      ? new URLBuild("app/upload")
      : new URLBuild("app/import");

    urlBuild.addParam("name", name);
    urlBuild.addParam("keepdata", keepData);
    urlBuild.addParam("excludeconnections", excludeDataConnections);

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
    const urlBuild = new URLBuild(`app/${id}/publish`);

    let streamId: string;
    if (isGUID(stream)) {
      streamId = stream;
    } else {
      streamId = await this.repoClient
        .Get(`stream?filter=(name eq '${stream}')`)
        .then((streams) => {
          if (streams.data.length == 0) throw new Error("Stream not found");
          return streams.data[0].id;
        });
    }

    urlBuild.addParam("stream", streamId);
    urlBuild.addParam("name", name);
    return await this.repoClient
      .Put(urlBuild.getUrl(), {})
      .then((res) => res.data as IApp);
  }

  public async appUpdate(this: QlikRepoApi, arg: IAppUpdate): Promise<IApp> {
    let app = await this.appGet(arg.id);

    if (arg.name) app.name = arg.name;
    if (arg.description) app.description = arg.description;
    if (arg.modifiedByUserName) app.modifiedByUserName = arg.modifiedByUserName;

    let updateCommon = new UpdateCommonProperties(this, app, arg);
    app = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`app/${arg.id}`, { ...app })
      .then((res) => res.data as IApp);
  }
}
