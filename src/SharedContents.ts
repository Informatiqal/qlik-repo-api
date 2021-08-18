import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild } from "./util/generic";
import { GetCommonProperties } from "./util/GetCommonProps";

import {
  IEntityRemove,
  IFileExtensionWhiteListCondensed,
  IStaticContentReferenceCondensed,
  ISelection,
} from "./types/interfaces";

import { ICustomPropertyCondensed } from "./CustomProperties";
import { ITagCondensed } from "./Tags";
import { IOwner } from "./Users";
import { IClassSharedContent, SharedContent } from "./SharedContent";

export interface ISharedContentUpdate {
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

export interface IClassSharedContents {
  get(id: string): Promise<IClassSharedContent>;
  getAll(): Promise<IClassSharedContent[]>;
  getFilter(filter: string): Promise<IClassSharedContent[]>;
  create(arg: ISharedContentCreate): Promise<IClassSharedContent>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
}

export class SharedContents implements IClassSharedContents {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`sharedContent.get: "id" parameter is required`);
    const shc: SharedContent = new SharedContent(this.repoClient, id);
    await shc.init();

    return shc;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`sharedcontent/full`)
      .then((res) => res.data as ISharedContent[])
      .then((data) => {
        return data.map((t) => new SharedContent(this.repoClient, t.id, t));
      });
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(
        `sharedContent.getFilter: "filter" parameter is required`
      );

    return await this.repoClient
      .Get(`sharedcontent/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ISharedContent[])
      .then((data) => {
        return data.map((t) => new SharedContent(this.repoClient, t.id, t));
      });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `sharedContent.removeFilter: "filter" parameter is required`
      );

    const shc = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      shc.map((sc: IClassSharedContent) =>
        sc.remove().then((s) => ({ id: sc.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/sharedcontent`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async create(arg: ISharedContentCreate) {
    if (!arg.name)
      throw new Error(`sharedContent.create: "name" parameter is required`);
    if (!arg.type)
      throw new Error(`sharedContent.create: "type" parameter is required`);

    let sharedContent: { [k: string]: any } = {};

    sharedContent["name"] = arg.name;
    sharedContent["type"] = arg.type;

    if (arg.description) sharedContent["description"] = arg.description;

    const getCommon = new GetCommonProperties(
      this.repoClient,
      arg.customProperties || [],
      arg.tags || [],
      ""
    );
    const commonProps = await getCommon.getAll();

    return await this.repoClient
      .Post(`sharedcontent`, { ...sharedContent, ...commonProps })
      .then((res) => res.data as ISharedContent)
      .then((s) => new SharedContent(this.repoClient, s.id, s));
  }
}
