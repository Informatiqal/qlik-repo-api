import { QlikRepositoryClient } from "qlik-rest-api";
import { IObject } from "./types/interfaces";

export interface IClassPrivileges {
  get(arg: { item: IObject; filter?: string }): Promise<string[]>;
  assert(arg: { item: IObject; privileges?: string[] }): Promise<boolean>;
}

export class Privileges implements IClassPrivileges {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { item: IObject; filter?: string }) {
    if (!arg.item.schemaPath)
      throw new Error(`privileges.get: "object.schemaPath" is missing`);
    let url = `${arg.item.schemaPath}`;
    if (arg.filter) url += `/?privilegesFilter=${arg.filter}`;

    return await this.#repoClient.Post<string[]>(url, arg.item).then((res) => {
      return res.data;
    });
  }

  public async assert(arg: { item: IObject; privileges?: string[] }) {
    const access = await this.get(arg.item);

    if (arg.privileges) {
      arg.privileges.filter((p) => {
        if (!access.includes(p))
          throw new Error(
            `privileges.assert: Expected "${p}" to ber found in collection "${access.join(
              ", "
            )}. ${arg.item.schemaPath} - ${arg.item.id}"`
          );

        return p;
      });
    }

    return true;
  }
}
