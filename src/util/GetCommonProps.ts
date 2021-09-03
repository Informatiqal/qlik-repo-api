// import { Tag, IClassTag } from "../Tag";
import { ITagCondensed, IClassTags, Tags } from "../Tags";
import { IUser, IClassUsers, Users, IUserCondensed } from "../Users";
import {
  ICustomPropertyCondensed,
  IClassCustomProperties,
  CustomProperties,
  ICustomProperty,
} from "../CustomProperties";
import { ICustomPropertyValue } from "../CustomProperties";
import { QlikRepositoryClient } from "qlik-rest-api";
import { IClassTag } from "../Tag";

export class GetCommonProperties {
  private qlikUtil: QlikRepositoryClient;
  private customProperties: string[];
  private tags: string[];
  private owner: string;
  private props = {
    customProperties: [],
    tags: [],
    owner: {},
  } as any;
  private user: IClassUsers;
  private tagsClass: IClassTags;
  private customPropertiesClass: IClassCustomProperties;
  // private repoApi: QlikRepositoryClient;
  constructor(
    qlikUtil: any,
    customProperties: string[],
    tags: string[],
    owner: string
    // repoApi?: QlikRepositoryClient
  ) {
    this.qlikUtil = qlikUtil;
    this.customProperties = customProperties;
    this.tags = tags;
    this.owner = owner;
    this.customPropertiesClass = new CustomProperties(this.qlikUtil);
    this.tagsClass = new Tags(this.qlikUtil);
    this.user = new Users(this.qlikUtil);
    // this.repoApi = repoApi;
  }

  private async getCustomProperties(): Promise<ICustomPropertyValue | void> {
    if (this.customProperties && this.customProperties.length > 0) {
      this.props.customProperties = await Promise.all<ICustomPropertyValue>(
        this.customProperties.map(async (customProperty) => {
          let [cpName, cpValue] = customProperty.split("=");
          return await this.customPropertiesClass
            .getFilter({ filter: `name eq '${cpName}'` })
            .then((cpData) => {
              if (cpData.length == 0)
                throw new Error(`Non existing custom property "${cpName}"`);
              return {
                definition: cpData[0].details as ICustomPropertyCondensed,
                value: cpValue,
              } as ICustomPropertyValue;
            });
        })
      );
    }
  }

  private async getTags(): Promise<ITagCondensed | void> {
    if (this.tags && this.tags.length > 0) {
      this.props.tags = await Promise.all<ITagCondensed>(
        this.tags.map(async (tag) => {
          return await this.tagsClass
            .getFilter({ filter: `name eq '${tag}'` })
            .then((tagsData) => {
              if (tagsData.length == 0)
                throw new Error(`Non existing tag "${tag}"`);
              return tagsData[0].details as ITagCondensed;
            });
        })
      );
    }
  }

  private async getOwner(): Promise<IUser | void> {
    if (this.owner) {
      let [userDirectory, userId] = this.owner.split("\\");

      this.props.owner = await this.user
        .getFilter({
          filter: `userId  eq '${userId}' and userDirectory eq '${userDirectory}'`,
        })
        .then((userData) => {
          if (userData.length == 0)
            throw new Error(`Non existing user "${userDirectory}\\${userId}"`);
          return userData[0].details as IUser;
        });
    }
  }

  async getAll() {
    await Promise.all([
      this.getCustomProperties(),
      this.getTags(),
      this.getOwner(),
    ]);

    return this.props;
  }
}
