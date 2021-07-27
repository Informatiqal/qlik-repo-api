import { QlikRepositoryClient } from "qlik-rest-api";

export interface IAbout {
  buildDate: string;
  buildVersion: string;
  databaseProvider: string;
  nodeType: number;
  requiresBootstrap: boolean;
  schemaPath: string;
  sharedPersistence: boolean;
  singleNodeOnly: boolean;
}

export interface IClassAbout {
  get(): Promise<IAbout>;
  enums(): Promise<any>;
  openApi(): Promise<string[]>;
  apiRelations(): Promise<string[]>;
  apiDescription(): Promise<string[]>;
  apiDefaults(path: string): Promise<any>;
}

export class About implements IClassAbout {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get() {
    return await this.repoClient.Get(`about`).then((res) => res.data as IAbout);
  }

  public async enums() {
    return await this.repoClient.Get(`about/api/enums`).then((res) => res.data);
  }

  public async openApi() {
    return await this.repoClient
      .Get(`about/openapi`)
      .then((res) => res.data as string[]);
  }

  public async apiRelations() {
    return await this.repoClient
      .Get(`about/api/relations`)
      .then((res) => res.data as string[]);
  }

  public async apiDescription() {
    return await this.repoClient
      .Get(`about/api/description`)
      .then((res) => res.data as string[]);
  }

  public async apiDefaults(path: string) {
    if (!path)
      throw new Error(`aboutApiDefaults: "path" parameter is required`);
    return await this.repoClient
      .Get(`about/api/default/${path}`)
      .then((res) => res.data);
  }
}
