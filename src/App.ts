import { QlikGenericRestClient, QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild, uuid } from "./util/generic";
import { IHttpStatus, IUpdateObjectOptions } from "./types/interfaces";
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
  copy(arg: {
    name?: string;
    includeCustomProperties?: boolean;
  }): Promise<IClassApp>;
  export(arg: { fileName?: string; skipData?: boolean }): Promise<Buffer>;
  remove(): Promise<IHttpStatus>;
  publish(arg: { stream: string; name?: string }): Promise<IClassApp>;
  switch(arg: { targetAppId: string }): Promise<IHttpStatus>;
  update(arg: IAppUpdate, options?: IUpdateObjectOptions): Promise<IApp>;
}

export class App implements IClassApp {
  #id: string;
  #repoClient: QlikRepositoryClient;
  #genericClient: QlikGenericRestClient;
  details: IApp;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IApp,
    genericClient?: QlikGenericRestClient
  ) {
    if (!id) throw new Error(`app.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    this.#genericClient = genericClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get(`app/${this.#id}`)
        .then((res) => res.data as IApp);
    }
  }

  public async export(arg: { fileName?: string; skipData?: boolean }) {
    const token = uuid();
    const urlBuild = new URLBuild(`app/${this.details.id}/export/${token}`);
    if (!arg.fileName) arg.fileName = `${this.details.id}.qvf`;

    urlBuild.addParam("skipdata", arg.skipData);

    const downloadPath: string = await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((response) => response.data)
      .then((data) => {
        return data.downloadPath.replace("/tempcontent", "tempcontent");
      });

    return await this.#genericClient
      .Get(downloadPath)
      .then((r) => r.data as Buffer);
  }

  public async copy(arg: { name?: string; includeCustomProperties?: boolean }) {
    const urlBuild = new URLBuild(`app/${this.details.id}/copy`);
    if (arg.name) urlBuild.addParam("name", arg.name);
    if (arg.includeCustomProperties)
      urlBuild.addParam("includecustomproperties", arg.includeCustomProperties);

    return await this.#repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => new App(this.#repoClient, res.data.id, res.data));
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`app/${this.details.id}`)
      .then((res) => res.status);
  }

  public async publish(arg: { stream: string; name?: string }) {
    if (!arg.stream)
      throw new Error(`app.publish: "stream" parameter is required`);

    let streamRes = await this.#repoClient.Get(
      `stream?filter=(name eq '${arg.stream}')`
    );

    if (streamRes.data.length == 0)
      throw new Error(`app.publish: Stream "${arg.stream}" not found`);

    if (streamRes.data.length > 1)
      throw new Error(`app.publish: Multiple streams found "${arg.stream}"`);

    const urlBuild = new URLBuild(`app/${this.details.id}/publish`);
    urlBuild.addParam("stream", streamRes.data[0].id);
    urlBuild.addParam("name", arg.name);

    return await this.#repoClient.Put(urlBuild.getUrl(), {}).then((res) => {
      this.details = res.data;
      return res.data;
    });
  }

  public async update(arg: IAppUpdate, options?: IUpdateObjectOptions) {
    if (arg.name) this.details.name = arg.name;
    if (arg.description) this.details.description = arg.description;

    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put(`app/${this.details.id}`, { ...this.details })
      .then((res) => res.data as IApp);
  }

  public async switch(arg: { targetAppId: string }) {
    if (!arg.targetAppId)
      throw new Error(`app.switch: "targetAppId" parameter is required`);

    return await this.#repoClient
      .Put(`app/${this.details.id}/replace?app=${arg.targetAppId}`, {})
      .then((res) => {
        this.details = res.data;
        return res.status;
      });
  }
}
