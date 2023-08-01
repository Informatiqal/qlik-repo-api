import { QlikRepositoryClient, QlikGenericRestClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { ArgValidationError } from "./util/CustomErrors";
import {
  zodGetByIdSchema,
  zodGetByFilterSchema,
  zodAppExportManySchema,
  zodOnlyFilterSchema,
  zodAppUpload,
  zodAppUploadAndReplace,
  zodAppUploadMany,
} from "./types/ZodSchemas";

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

export class Apps {
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

  /**
   * Get single app instance
   */
  public async get(arg: { id: string }): Promise<App> {
    const argParse = zodGetByIdSchema.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("apps.get", argParse.error.issues);

    const app: App = new App(
      this.#repoClient,
      arg.id,
      undefined,
      this.#genericClient,
      this.#genericClientWithPort
    );
    await app.init();

    return app;
  }

  /**
   * Get all available apps instance for a user
   */
  public async getAll(): Promise<App[]> {
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

  /**
   * Get array of apps instance based on the supplied filter
   */
  public async getFilter(arg: {
    filter: string;
    orderBy?: string;
  }): Promise<App[]> {
    const argParse = zodGetByFilterSchema.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("apps.getFilter", argParse.error.issues);

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

  /**
   * Export multiple qvf to Buffer
   */
  public async exportMany(arg: { filter: string; skipData?: boolean }): Promise<
    {
      file: IncomingMessage;
      exportToken: string | undefined;
      name: string;
      id: string;
    }[]
  > {
    const argParse = zodAppExportManySchema.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("apps.exportMany", argParse.error.issues);

    const apps = await this.getFilter(arg);

    return await Promise.all(
      apps.map((a) => a.export({ skipData: arg.skipData || false }))
    );
  }

  /**
   * Upload an qvf
   */
  public async upload(arg: IAppUpload): Promise<App> {
    const argParse = zodAppUpload.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("apps.upload", argParse.error.issues);

    const urlBuild = new URLBuild("app/upload");
    urlBuild.addParam("name", arg.name);
    urlBuild.addParam("keepdata", arg.keepData);
    urlBuild.addParam("excludeconnections", arg.excludeDataConnections);

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

  /**
   * Upload multiple apps in a single method
   */
  public async uploadMany(arg: {
    apps: [
      {
        name: string;
        file: Buffer;
        keepData?: boolean;
        excludeDataConnections?: boolean;
      }
    ];
    sequence?: Boolean;
  }): Promise<App[]> {
    const argParse = zodAppUploadMany.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("apps.upload", argParse.error.issues);

    return await Promise.all(
      arg.apps.map((a) => {
        return this.upload(a);
      })
    );
  }

  /**
   * EXPERIMENTAL
   *
   * Upload an qvf and replace an existing app with it
   */
  public async uploadAndReplace(arg: IAppUploadAndReplace): Promise<App> {
    const argParse = zodAppUploadAndReplace.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError(
        "apps.uploadAndReplace",
        argParse.error.issues
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
            undefined,
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

  /**
   * Remove apps based on the supplied filter
   */
  public async removeFilter(arg: { filter: string }): Promise<IEntityRemove[]> {
    const argParse = zodOnlyFilterSchema.safeParse(arg);
    if (!argParse.success)
      throw new ArgValidationError("apps.removeFilter", argParse.error.issues);

    const apps = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      apps.map((app: App) =>
        app.remove().then((s) => ({ id: app.details.id, status: s }))
      )
    );
  }

  /**
   * Create selection based on the supplied filter
   */
  public async select(arg?: { filter: string }): Promise<ISelection> {
    if (arg) {
      const argParse = zodOnlyFilterSchema.safeParse(arg);
      if (!argParse.success)
        throw new ArgValidationError("apps.select", argParse.error.issues);
    }

    const urlBuild = new URLBuild(`selection/app`);
    urlBuild.addParam("filter", arg?.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }
}
