import { QlikRepoApi } from "./main";

import { IAbout } from "./interfaces";

export class About {
  constructor() {}

  public async aboutGet(this: QlikRepoApi): Promise<IAbout> {
    return await this.repoClient.Get(`about`).then((res) => res.data as IAbout);
  }

  public async aboutEnums(this: QlikRepoApi): Promise<string[]> {
    return await this.repoClient
      .Get(`about/api/enums`)
      .then((res) => res.data as string[]);
  }

  public async aboutOpenApi(this: QlikRepoApi): Promise<string[]> {
    return await this.repoClient
      .Get(`about/api/openapi`)
      .then((res) => res.data as string[]);
  }

  public async aboutApiRelations(this: QlikRepoApi): Promise<string[]> {
    return await this.repoClient
      .Get(`relations`)
      .then((res) => res.data as string[]);
  }

  public async aboutApiDescription(this: QlikRepoApi): Promise<string[]> {
    return await this.repoClient
      .Get(`about/api/description`)
      .then((res) => res.data as string[]);
  }

  public async aboutApiDefaults(this: QlikRepoApi, path: string): Promise<any> {
    return await this.repoClient
      .Get(`about/api/default/${path}`)
      .then((res) => res.data as any);
  }
}
