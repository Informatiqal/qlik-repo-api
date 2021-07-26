import { QlikRepoApi } from "./main";

import { IObject } from "./interfaces";

export class Privileges {
  constructor() {}

  public async privilegesGet(
    this: QlikRepoApi,
    item: IObject,
    filter?: string
  ): Promise<string[]> {
    if (!item.schemaPath)
      throw new Error(`privilegesGet: "object.schemaPath" is missing`);
    let url = `${item.schemaPath}`;
    if (filter) url += `/?privilegesFilter=${filter}`;

    return await this.repoClient.Post(url, item).then((res) => {
      return res.data as string[];
    });
  }

  public async privilegesAssert(
    this: QlikRepoApi,
    item: IObject,
    privileges?: string[]
  ): Promise<boolean> {
    let access = await this.privilegesGet(item);

    privileges.filter((p) => {
      if (!access.includes(p))
        throw new Error(
          `Expected "${p}" to ber found in collection "${access.join(", ")}. ${
            item.schemaPath
          } - ${item.id}"`
        );

      return p;
    });

    return true;
  }
}
