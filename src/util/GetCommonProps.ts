import { ITagCondensed } from "../Tag";
import { IUser } from "../User";
import { ICustomPropertyCondensed } from "../CustomProperty";
import { ICustomPropertyObject } from "../types/interfaces";

export class GetCommonProperties {
  private qlikUtil: any;
  private customProperties: string[];
  private tags: string[];
  private owner: string;
  private props = {
    customProperties: [],
    tags: [],
    owner: "",
  };
  constructor(
    qlikUtil: any,
    customProperties: string[],
    tags: string[],
    owner: string
  ) {
    this.qlikUtil = qlikUtil;
    this.customProperties = customProperties;
    this.tags = tags;
    this.owner = owner;
  }

  private async getCustomProperties(): Promise<ICustomPropertyObject | void> {
    if (this.customProperties && this.customProperties.length > 0) {
      this.props.customProperties = await Promise.all<ICustomPropertyObject>(
        this.customProperties.map(async (customProperty) => {
          let [cpName, cpValue] = customProperty.split("=");
          return await this.qlikUtil
            .customPropertyGetFilter(`name eq '${cpName}'`)
            .then((cpData) => {
              if (cpData.length == 0)
                throw new Error(`Non existing custom property "${cpName}"`);
              return {
                definition: cpData[0] as ICustomPropertyCondensed,
                value: cpValue,
              } as ICustomPropertyObject;
            });
        })
      );
    }
  }

  private async getTags(): Promise<ITagCondensed | void> {
    if (this.tags && this.tags.length > 0) {
      this.props.tags = await Promise.all<ITagCondensed>(
        this.tags.map(async (tag) => {
          return await this.qlikUtil
            .tagGetFilter(`name eq '${tag}'`)
            .then((tagsData) => {
              if (tagsData.length == 0)
                throw new Error(`Non existing tag "${tag}"`);
              return tagsData[0] as ITagCondensed;
            });
        })
      );
    }
  }

  private async getOwner(): Promise<IUser | void> {
    if (this.owner) {
      let [userDirectory, userId] = this.owner.split("\\");

      this.props.owner = await this.qlikUtil
        .userGetFilter(
          `userId  eq '${userId}' and userDirectory eq '${userDirectory}'`
        )
        .then((userData) => {
          if (userData.length == 0)
            throw new Error(`Non existing user "${userDirectory}\\${userId}"`);
          return userData[0] as IUser;
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
