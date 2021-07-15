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
    return await this.repoClient
      .Get(`contentlibrary/${id}`)
      .then((res) => res.data as IContentLibrary);
  }

  public async contentLibraryGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<IContentLibraryCondensed[]> {
    return await this.repoClient
      .Get(`contentlibrary?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as IContentLibrary[]);
  }

  public async contentLibraryCreate(
    this: QlikRepoApi,
    name: string
  ): Promise<IContentLibrary> {
    return await this.repoClient
      .Post(`contentlibrary`, { name })
      .then((res) => res.data as IContentLibrary);
  }

  public async contentLibraryRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    return await this.repoClient.Delete(`contentlibrary/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async contentLibraryUpdate(
    this: QlikRepoApi,
    arg: IContentLibraryUpdate
  ): Promise<IContentLibrary> {
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
