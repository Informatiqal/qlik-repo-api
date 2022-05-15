import { IClassTags, Tags } from "../Tags";
// import { IClassUsers, Users } from "../Users";
import {
  ITagCondensed,
  ICustomPropertyCondensed,
  IUser,
  ICustomPropertyValue,
} from "../types/interfaces";
import { IClassCustomProperties, CustomProperties } from "../CustomProperties";
import { QlikRepositoryClient } from "qlik-rest-api";

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
  // private user: IClassUsers;
  private tagsClass: IClassTags;
  private customPropertiesClass: IClassCustomProperties;
  constructor(
    qlikUtil: QlikRepositoryClient,
    customProperties: string[],
    tags: string[],
    owner: string
  ) {
    this.qlikUtil = qlikUtil;
    this.customProperties = customProperties;
    this.tags = tags;
    this.owner = owner;
    this.customPropertiesClass = new CustomProperties(this.qlikUtil);
    this.tagsClass = new Tags(this.qlikUtil);
    // this.user = new Users(this.qlikUtil);
  }

  private async getCustomProperties(): Promise<ICustomPropertyValue | void> {
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

  private async getTags(): Promise<ITagCondensed | void> {
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

  private async getOwner(): Promise<IUser | void> {
    let [userDirectory, userId] = this.owner.split("\\");

    const filter = `userId eq '${userId}' and userDirectory eq '${userDirectory}'`;
    this.props.owner = await this.qlikUtil
      .Get(`user/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => {
        if (res.data.length == 0)
          throw new Error(`Non existing user "${userDirectory}\\${userId}"`);
        return res.data[0].details as IUser;
      });
  }

  async getAll() {
    let promises = [];

    if (this.owner) promises.push(this.getOwner());
    if (this.tags && this.tags.length > 0) promises.push(this.getTags());
    if (this.customProperties && this.customProperties.length > 0)
      promises.push(this.getCustomProperties());

    await Promise.all(promises);

    return this.props;
  }
}
