import { IApp } from "./Apps";
import { IAppObject } from "./AppObjects";
import { IContentLibrary } from "./ContentLibraries";
import { ICustomProperty } from "./CustomProperties";
import { IDataConnection } from "./DataConnections";
import { IEngine } from "./Engines";
import { IExtension } from "./Extensions";
import { IStream } from "./Streams";
import { ISystemRule } from "./SystemRule.interface";
import { ITag } from "./Tags";
import { ITask } from "./Task.interface";
import { IUser } from "./Users";
import { IUserDirectory } from "./UserDirectories";
import { QlikRepositoryClient } from "qlik-rest-api";

export type IObject =
  | IApp
  | IAppObject
  | IContentLibrary
  | ICustomProperty
  | IDataConnection
  | IEngine
  | IExtension
  | IStream
  | ISystemRule
  | ITag
  | ITask
  | IUser
  | IUserDirectory
  | any;

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

    return await this.#repoClient.Post(url, arg.item).then((res) => {
      return res.data as string[];
    });
  }

  public async assert(arg: { item: IObject; privileges?: string[] }) {
    const access = await this.get(arg.item);

    arg.privileges.filter((p) => {
      if (!access.includes(p))
        throw new Error(
          `privileges.assert: Expected "${p}" to ber found in collection "${access.join(
            ", "
          )}. ${arg.item.schemaPath} - ${arg.item.id}"`
        );

      return p;
    });

    return true;
  }
}
