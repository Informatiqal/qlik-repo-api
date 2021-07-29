import { QlikRepositoryClient } from "./main";

import {
  IApp,
  IAppObject,
  IContentLibrary,
  ICustomProperty,
  IDataConnection,
  IEngine,
  IExtension,
  IStream,
  ISystemRule,
  ITag,
  ITask,
  IUser,
  IUserDirectory,
} from "./main";

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
  get(item: IObject, filter?: string): Promise<string[]>;
  assert(item: IObject, privileges?: string[]): Promise<boolean>;
}

export class Privileges implements IClassPrivileges {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(item: IObject, filter?: string) {
    if (!item.schemaPath)
      throw new Error(`privileges.get: "object.schemaPath" is missing`);
    let url = `${item.schemaPath}`;
    if (filter) url += `/?privilegesFilter=${filter}`;

    return await this.repoClient.Post(url, item).then((res) => {
      return res.data as string[];
    });
  }

  public async assert(item: IObject, privileges?: string[]) {
    let access = await this.get(item);

    privileges.filter((p) => {
      if (!access.includes(p))
        throw new Error(
          `privileges.assert: Expected "${p}" to ber found in collection "${access.join(
            ", "
          )}. ${item.schemaPath} - ${item.id}"`
        );

      return p;
    });

    return true;
  }
}
