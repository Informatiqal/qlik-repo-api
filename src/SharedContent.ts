import { QlikRepositoryClient } from "./main";
import { URLBuild } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { GetCommonProperties } from "./util/GetCommonProps";

import {
  IEntityRemove,
  IFileExtensionWhiteListCondensed,
  IStaticContentReferenceCondensed,
  IOwner,
} from "./types/interfaces";

import { ICustomPropertyCondensed } from "./CustomProperty";
import { ITagCondensed } from "./Tag";

export interface ISharedContentUpdate {
  id: string;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
  name?: string;
  type?: string;
  description?: string;
}

export interface ISharedContentMetaData {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  key?: string;
  value?: string;
}

export interface ISharedContentCreate {
  id: string;
  tags?: string[];
  customProperties?: string[];
  name?: string;
  type?: string;
  description?: string;
}

export interface ISharedContentCondensed {
  id?: string;
  privileges?: string[];
  name: string;
  type: string;
  description?: string;
  uri?: string;
  metaData?: ISharedContentMetaData[];
}

export interface ISharedContent extends ISharedContentCondensed {
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  customProperties?: ICustomPropertyCondensed[];
  tags?: ITagCondensed[];
  owner: IOwner;
  whiteList: IFileExtensionWhiteListCondensed;
  references?: IStaticContentReferenceCondensed[];
}
export interface IClassSharedContent {
  get(id: string): Promise<ISharedContent>;
  getAll(): Promise<ISharedContentCondensed[]>;
  getFilter(filter: string): Promise<ISharedContentCondensed[]>;
  create(arg: ISharedContentCreate): Promise<ISharedContent>;
  deleteFile(id: string, externalPath: string): Promise<IEntityRemove>;
  remove(id: string): Promise<IEntityRemove>;
  update(arg: ISharedContentUpdate): Promise<ISharedContent>;
  uploadFile(id: string, file: Buffer, externalPath: string): Promise<string>;
}

export class SharedContent implements IClassSharedContent {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`sharedContentGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`sharedcontent/${id}`)
      .then((res) => res.data as ISharedContent);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`sharedcontent`)
      .then((res) => res.data as ISharedContentCondensed[]);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`sharedContentGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`sharedcontent/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ISharedContentCondensed[]);
  }

  public async remove(id: string): Promise<IEntityRemove> {
    if (!id) throw new Error(`sharedContentRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`sharedcontent/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async uploadFile(id: string, file: Buffer, externalPath: string) {
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

  public async deleteFile(id: string, externalPath: string) {
    if (!id)
      throw new Error(`sharedContentDeleteFile: "id" parameter is required`);
    if (!externalPath)
      throw new Error(
        `sharedContentDeleteFile: "externalPath" parameter is required`
      );

    const urlBuild = new URLBuild(`sharedcontent/${id}/deletecontent`);
    urlBuild.addParam("externalpath", externalPath);

    return await this.repoClient.Delete(urlBuild.getUrl()).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async update(arg: ISharedContentUpdate) {
    if (!arg.id)
      throw new Error(`sharedContentUpdate: "id" parameter is required`);

    let sharedContent = await this.get(arg.id);

    if (arg.name) sharedContent.name = arg.name;
    if (arg.description) sharedContent.description = arg.description;
    if (arg.type) sharedContent.type = arg.type;

    const updateCommon = new UpdateCommonProperties(this, sharedContent, arg);
    sharedContent = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`sharedcontent/${arg.id}`, { ...sharedContent })
      .then((res) => res.data as ISharedContent);
  }

  public async create(arg: ISharedContentCreate) {
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
