import { QlikRepoApi } from "./main";
import { URLBuild } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { GetCommonProperties } from "./util/GetCommonProps";

import {
  IHttpStatus,
  ISharedContent,
  ISharedContentCondensed,
  IHttpReturnRemove,
} from "./interfaces";

import {
  ISharedContentUpdate,
  ISharedContentCreate,
} from "./interfaces/argument.interface";

export class SharedContent {
  constructor() {}

  public async sharedContentGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<ISharedContent[] | ISharedContentCondensed[]> {
    let url = "sharedcontent";
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res) => {
      if (!id) return res.data as ISharedContentCondensed[];

      return [res.data] as ISharedContent[];
    });
  }

  public async sharedContentGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<ISharedContentCondensed[]> {
    if (!filter)
      throw new Error(`sharedContentGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`sharedcontent/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ISharedContentCondensed[]);
  }

  public async sharedContentRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`sharedContentRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`sharedcontent/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async sharedContentUploadFile(
    this: QlikRepoApi,
    id: string,
    file: Buffer,
    externalPath: string
  ): Promise<string> {
    if (!id)
      throw new Error(`sharedContentUploadFile: "id" parameter is required`);
    if (!file)
      throw new Error(`sharedContentUploadFile: "file" parameter is required`);
    if (!externalPath)
      throw new Error(
        `sharedContentUploadFile: "externalPath" parameter is required`
      );

    const urlBuild = new URLBuild(`sharedcontent/${id}/uploadfile`);
    urlBuild.addParam("externalpath", externalPath);

    return await this.repoClient
      .Post(urlBuild.getUrl(), file)
      .then((res) => res.data as string);
  }

  public async sharedContentDeleteFile(
    this: QlikRepoApi,
    id: string,
    externalPath: string
  ): Promise<IHttpReturnRemove> {
    if (!id)
      throw new Error(`sharedContentDeleteFile: "id" parameter is required`);
    if (!externalPath)
      throw new Error(
        `sharedContentDeleteFile: "externalPath" parameter is required`
      );

    const urlBuild = new URLBuild(`sharedcontent/${id}/deletecontent`);
    urlBuild.addParam("externalpath", externalPath);

    return await this.repoClient.Delete(urlBuild.getUrl()).then((res) => {
      return { id, status: res.status };
    });
  }

  public async sharedContentUpdate(
    this: QlikRepoApi,
    arg: ISharedContentUpdate
  ): Promise<ISharedContent> {
    if (!arg.id)
      throw new Error(`sharedContentUpdate: "id" parameter is required`);

    let sharedContent = await this.sharedContentGet(arg.id).then(
      (t) => t[0] as ISharedContent
    );

    if (arg.name) sharedContent.name = arg.name;
    if (arg.description) sharedContent.description = arg.description;
    if (arg.type) sharedContent.type = arg.type;

    const updateCommon = new UpdateCommonProperties(this, sharedContent, arg);
    sharedContent = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`sharedcontent/${arg.id}`, { ...sharedContent })
      .then((res) => res.data as ISharedContent);
  }

  public async sharedContentCreate(
    this: QlikRepoApi,
    arg: ISharedContentCreate
  ): Promise<ISharedContent> {
    if (!arg.id)
      throw new Error(`sharedContentCreate: "id" parameter is required`);
    if (!arg.name)
      throw new Error(`sharedContentCreate: "id" parameter is required`);
    if (!arg.type)
      throw new Error(`sharedContentCreate: "id" parameter is required`);

    let sharedContent = {
      name: arg.name,
      type: arg.type,
    };

    if (arg.description) sharedContent["description"] = arg.description;

    const getCommon = new GetCommonProperties(
      this,
      arg.customProperties || [],
      arg.tags || [],
      ""
    );
    const commonProps = await getCommon.getAll();

    return await this.repoClient
      .Post(`sharedcontent/${arg.id}`, { sharedContent, ...commonProps })
      .then((res) => res.data as ISharedContent);
  }
}
