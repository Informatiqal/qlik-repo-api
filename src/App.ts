import { QlikGenericRestClient, QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild, uuid } from "./util/generic";
import { IStream, IUpdateObjectOptions } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { IApp, IAppUpdate } from "./types/interfaces";
import { IncomingMessage } from "http";
import {
  zodAppPublish,
  zodAppSwitch,
  zodAppUpdate,
  zodUpdateObjectOptions,
} from "./types/ZodSchemas";
import { ArgValidationError } from "./util/CustomErrors";

// export interface IClassApp {
//   details: IApp;
//   copy(arg: { name?: string; includeCustomProperties?: boolean }): Promise<App>;
//   export(arg?: { token?: string; skipData?: boolean }): Promise<{
//     file: IncomingMessage;
//     exportToken: string | undefined;
//     name: string;
//     id: string;
//   }>;
//   remove(): Promise<IHttpStatus>;
//   publish(arg: { stream: string; name?: string }): Promise<IApp>;
//   switch(arg: { targetAppId: string }): Promise<IHttpStatus>;
//   update(arg: IAppUpdate, options?: IUpdateObjectOptions): Promise<IApp>;
// }

export class App {
  #id: string;
  #repoClient: QlikRepositoryClient;
  #genericClient: QlikGenericRestClient;
  #genericClientWithPort: QlikGenericRestClient;
  details: IApp;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IApp,
    genericClient?: QlikGenericRestClient,
    genericClientWithPort?: QlikGenericRestClient
  ) {
    if (!id) throw new Error(`app.get: "id" parameter is required`);

    this.details = {} as IApp;
    this.#id = id;
    this.#repoClient = repoClient;
    this.#genericClient = genericClient ?? ({} as QlikGenericRestClient);
    this.#genericClientWithPort =
      genericClientWithPort ?? ({} as QlikGenericRestClient);
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IApp>(`app/${this.#id}`)
        .then((res) => res.data);
    }
  }

  /**
   * Export the current app
   */
  public async export(arg?: { token?: string; skipData?: boolean }) {
    const token = uuid();

    const props = arg || {
      token: token,
      skipData: false,
    };

    if (!props.token) props.token = token;

    const urlBuild = new URLBuild(
      `app/${this.details.id}/export/${props.token}`
    );
    urlBuild.addParam("skipdata", props.skipData);

    const downloadPath: string = await this.#repoClient
      .Post<{ downloadPath: string }>(urlBuild.getUrl(), {})
      .then((response) => response.data)
      .then((data) => data.downloadPath.replace("/tempcontent", "tempcontent"));

    return await this.#genericClient
      .Get<IncomingMessage>(downloadPath, "", "stream")
      .then((r) => {
        return {
          file: r.data,
          exportToken: props.token,
          id: `${this.details.id}`,
          name: `${this.details.name}.qvf`,
        };
      });
  }

  /**
   * Duplicate the current app
   */
  public async copy(arg: { name?: string; includeCustomProperties?: boolean }) {
    const urlBuild = new URLBuild(`app/${this.details.id}/copy`);
    if (arg.name) urlBuild.addParam("name", arg.name);
    if (arg.includeCustomProperties)
      urlBuild.addParam("includecustomproperties", arg.includeCustomProperties);

    return await this.#repoClient
      .Post<IApp>(urlBuild.getUrl(), {})
      .then((res) => new App(this.#repoClient, res.data.id, res.data));
  }

  /**
   * Delete the current app
   */
  public async remove() {
    return await this.#repoClient
      .Delete(`app/${this.details.id}`)
      .then((res) => res.status);
  }

  /**
   * Publish to app to a stream, identified by a name
   *
   * WARNING! This will publish the given app but will not overwrite an existing app
   *
   * To overwrite an existing app please use the "switch" method
   */
  public async publish(arg: { stream: string; name?: string }) {
    const argParse = zodAppPublish.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("app.publish", argParse.error.issues);

    const streamRes = await this.#repoClient.Get<IStream[]>(
      `stream?filter=(name eq '${arg.stream}')`
    );

    if (streamRes.data.length == 0)
      throw new Error(`app.publish: Stream "${arg.stream}" not found`);

    if (streamRes.data.length > 1)
      throw new Error(`app.publish: Multiple streams found "${arg.stream}"`);

    const urlBuild = new URLBuild(`app/${this.details.id}/publish`);
    urlBuild.addParam("stream", streamRes.data[0].id);
    urlBuild.addParam("name", arg.name);

    return await this.#repoClient
      .Put<IApp>(urlBuild.getUrl(), {})
      .then((res) => {
        this.details = res.data;
        return res.data;
      });
  }

  /**
   * Update meta-data for the current app
   */
  public async update(arg: IAppUpdate, options?: IUpdateObjectOptions) {
    const argParse = zodAppUpdate.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("app.update", argParse.error.issues);

    // if options are provided then validate them as well
    if (options) {
      const optionsParse = zodUpdateObjectOptions.safeParse(options);
      if (!optionsParse.success)
        throw new ArgValidationError("app.update", optionsParse.error.issues);
    }

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
      .Put<IApp>(`app/${this.details.id}`, { ...this.details })
      .then((res) => res.data);
  }

  /**
   * Overwrite an existing app with the current app
   */
  public async switch(arg: { targetAppId: string }) {
    const argParse = zodAppSwitch.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("app.switch", argParse.error.issues);

    return await this.#repoClient
      .Put<IApp>(`app/${this.details.id}/replace?app=${arg.targetAppId}`, {})
      .then((res) => {
        this.details = res.data;
        return res.status;
      });
  }
}
