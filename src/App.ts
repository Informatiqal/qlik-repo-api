import { QlikGenericRestClient, QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild, uuid } from "./util/generic";
import { IEntityRemove, IHttpStatus } from "./types/interfaces";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { IApp } from "./Apps";

export interface IAppUpdate {
  /**
   * Application name
   */
  name?: string;
  /**
   * Application description
   */
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
  /**
   * Stream name
   */
  stream?: string;
}

export interface IClassApp {
  details: IApp;
  copy(): Promise<IClassApp>;
  export(): Promise<Buffer>;
  remove(): Promise<IHttpStatus>;
  publish(stream: string, name?: string): Promise<IHttpStatus>;
  switch(sourceAppId: string, targetAppId: string): Promise<IHttpStatus>;
  update(arg: IAppUpdate): Promise<IHttpStatus>;
}

export class App implements IClassApp {
  private id: string;
  private repoClient: QlikRepositoryClient;
  private genericClient: QlikGenericRestClient;
  details: IApp;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IApp,
    genericClient?: QlikGenericRestClient
  ) {
    if (!id) throw new Error(`tags.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    this.genericClient = genericClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`app/${this.id}`)
        .then((res) => res.data as IApp);
    }
  }

  public async export(fileName?: string, skipData?: boolean) {
    if (!this.details.id)
      throw new Error(`app.export: "id" parameter is required`);

    const token = uuid();
    const urlBuild = new URLBuild(`app/${this.details.id}/export/${token}`);
    if (!fileName) fileName = `${this.details.id}.qvf`;

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

  public async copy(name?: string, includeCustomProperties?: boolean) {
    const urlBuild = new URLBuild(`app/${this.details.id}/copy`);
    if (name) urlBuild.addParam("name", name);
    if (includeCustomProperties)
      urlBuild.addParam("includecustomproperties", includeCustomProperties);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => new App(this.repoClient, res.data.id, res.data));
  }

  public async remove() {
    return await this.repoClient
      .Delete(`app/${this.details.id}`)
      .then((res) => res.status);
  }

  public async publish(stream: string, name?: string) {
    if (!stream) throw new Error(`app.publish: "stream" parameter is required`);

    let streamRes = await this.repoClient.Get(
      `stream?filter=(name eq '${stream}')`
    );

    if (streamRes.data.length == 0)
      throw new Error(`app.publish: Stream "${stream}" not found`);

    if (streamRes.data.length > 1)
      throw new Error(`app.publish: Multiple streams found "${stream}"`);

    const urlBuild = new URLBuild(`app/${this.details.id}/publish`);
    urlBuild.addParam("stream", streamRes.data[0].id);
    urlBuild.addParam("name", name);

    return await this.repoClient.Put(urlBuild.getUrl(), {}).then((res) => {
      this.details = res.data;
      return res.status;
    });
  }

  public async update(arg: IAppUpdate) {
    if (arg.name) this.details.name = arg.name;
    if (arg.description) this.details.description = arg.description;

    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      this.details,
      arg
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`app/${this.details.id}`, { ...this.details })
      .then((res) => res.status);
  }

  public async switch(targetAppId: string) {
    if (!targetAppId)
      throw new Error(`app.switch: "targetAppId" parameter is required`);

    return await this.repoClient
      .Put(`app/${this.details.id}/replace?app=${targetAppId}`, {})
      .then((res) => {
        this.details = res.data;
        return res.status;
      });
  }
}
