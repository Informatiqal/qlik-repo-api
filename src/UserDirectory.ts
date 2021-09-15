import { QlikRepositoryClient } from "qlik-rest-api";
import { IHttpStatus } from "./types/interfaces";
import {
  IUserDirectory,
  IUserDirectorySettings,
  IUserDirectoryUpdate,
} from "./UserDirectories";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassUserDirectory {
  remove(): Promise<IHttpStatus>;
  removeAndUsers(): Promise<IHttpStatus>;
  sync(): Promise<IHttpStatus>;
  update(arg: IUserDirectoryUpdate): Promise<IUserDirectory>;
  details: IUserDirectory;
}

export class UserDirectory implements IClassUserDirectory {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: IUserDirectory;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IUserDirectory
  ) {
    if (!id) throw new Error(`userDirectory.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`userdirectory/${this.id}`)
        .then((res) => res.data as IUserDirectory);
    }
  }

  public async remove() {
    return await this.repoClient
      .Delete(`userdirectory/${this.id}`)
      .then((res) => res.status);
  }

  public async removeAndUsers() {
    return await this.repoClient
      .Delete(
        `userdirectoryconnector/deleteudandusers?userDirectoryId=${this.id}`
      )
      .then((res) => res.status);
  }

  public async sync() {
    return await this.repoClient
      .Post(`userdirectoryconnector/syncuserdirectories`, [this.details.id])
      .then((res) => res.status as IHttpStatus);
  }

  public async update(arg: IUserDirectoryUpdate) {
    if (arg.name) this.details.name = arg.name;
    if (arg.userDirectoryName)
      this.details.userDirectoryName = arg.userDirectoryName;
    if (arg.syncOnlyLoggedInUsers)
      this.details.syncOnlyLoggedInUsers = arg.syncOnlyLoggedInUsers;
    if (arg.settings)
      this.details.settings =
        arg.settings as unknown as IUserDirectorySettings[];

    const updateCommon = new UpdateCommonProperties(
      this.repoClient,
      this.details,
      arg
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`userdirectory/${this.details.id}`, { ...this.details })
      .then((res) => res.data as IUserDirectory);
  }
}
