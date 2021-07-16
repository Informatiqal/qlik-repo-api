import { QlikRepoApi } from "./main";

import {
  IHttpStatus,
  IContentLibrary,
  IContentLibraryCondensed,
  IHttpReturnRemove,
} from "./interfaces";
import { IContentLibraryUpdate } from "./interfaces/argument.interface";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export class ContentLibrary {
  constructor() {}

  public async contentLibraryGet(
    this: QlikRepoApi,
    id: string
  ): Promise<IContentLibrary> {
    if (!id) throw new Error(`contentLibraryGet: "id" parameter is required`);

    return await this.repoClient
      .Get(`contentlibrary/${id}`)
      .then((res) => res.data as IContentLibrary);
  }

  public async contentLibraryGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IContentLibraryCondensed[]> {
    if (!filter)
      throw new Error(
        `contentLibraryGetFilter: "filter" parameter is required`
      );

    return await this.repoClient
      .Get(`contentlibrary?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IContentLibrary[]);
  }

  public async contentLibraryCreate(
    this: QlikRepoApi,
    name: string
  ): Promise<IContentLibrary> {
    if (!name)
      throw new Error(`contentLibraryCreate: "name" parameter is required`);

    return await this.repoClient
      .Post(`contentlibrary`, { name })
      .then((res) => res.data as IContentLibrary);
  }

  public async contentLibraryRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id)
      throw new Error(`contentLibraryRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`contentlibrary/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async contentLibraryUpdate(
    this: QlikRepoApi,
    arg: IContentLibraryUpdate
  ): Promise<IContentLibrary> {
    if (!arg.id)
      throw new Error(`contentLibraryUpdate: "id" parameter is required`);

    let contentLibrary = await this.contentLibraryGet(arg.id);

    if (arg.modifiedByUserName)
      contentLibrary.modifiedByUserName = arg.modifiedByUserName;

    let updateCommon = new UpdateCommonProperties(this, contentLibrary, arg);
    contentLibrary = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`contentlibrary/${arg.id}`, { ...contentLibrary })
      .then((res) => res.data as IContentLibrary);
  }
}
