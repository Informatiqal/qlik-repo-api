import { QlikRepositoryClient } from "qlik-rest-api";
import { IEntityRemove, IHttpStatus } from "./types/interfaces";
import { IUserDirectory } from "./UserDirectories";

export interface IClassUserDirectory {
  remove(): Promise<IEntityRemove>;
  sync(): Promise<IHttpStatus>;
  update(): Promise<boolean>;
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
    if (!id) throw new Error(`tags.get: "id" parameter is required`);

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
      .then((res) => {
        return { id: this.id, status: res.status } as IEntityRemove;
      });
  }

  public async sync() {
    return await this.repoClient
      .Post(`userdirectoryconnector/syncuserdirectories`, [this.details.id])
      .then((res) => res.status as IHttpStatus);
  }

  // TODO: Mismatch with the documentation. Investigation required
  public async update() {
    return true;
  }
}
