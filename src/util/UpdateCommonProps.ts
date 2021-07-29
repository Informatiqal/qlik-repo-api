import { modifiedDateTime } from "./generic";

import { QlikRepositoryClient } from "../main";

import { ICustomPropertyObject } from "../types/interfaces";
import {
  ICustomPropertyCondensed,
  IClassCustomProperty,
  CustomProperty,
} from "../CustomProperty";
import { IAppUpdate } from "../App";
import { ITagCondensed, Tag, IClassTag } from "../Tag";
import { ITaskCreate } from "../Task.interface";
import { IUserUpdate, IClassUser, User } from "../User";
import { IStreamUpdate, Stream, IClassStream } from "../Stream";
import { ISystemRuleCreate } from "../SystemRule.interface";
export class UpdateCommonProperties {
  private qlikUtil: QlikRepositoryClient;
  private customProperty: IClassCustomProperty;
  private stream: IClassStream;
  private tag: IClassTag;
  private user: IClassUser;
  private arg:
    | IUserUpdate
    | IAppUpdate
    | IStreamUpdate
    | ISystemRuleCreate
    | ITaskCreate;
  public obj: any;
  constructor(
    qlikUtil: any,
    obj,
    arg:
      | IUserUpdate
      | IAppUpdate
      | IStreamUpdate
      | ISystemRuleCreate
      | ITaskCreate
  ) {
    this.qlikUtil = qlikUtil;
    this.obj = obj;
    this.arg = arg;
    this.customProperty = new CustomProperty(this.qlikUtil);
    this.stream = new Stream(this.qlikUtil);
    this.tag = new Tag(this.qlikUtil);
    this.user = new User(this.qlikUtil);
  }

  async updateCustomProperties() {
    if (this.arg.customProperties && this.arg.customProperties.length == 0)
      this.obj.customProperties = [];
    if (this.arg.customProperties && this.arg.customProperties.length > 0) {
      this.obj.customProperties = await Promise.all<ICustomPropertyObject>(
        this.arg.customProperties.map(async (customProperty) => {
          let [cpName, cpValue] = customProperty.split("=");
          return await this.customProperty
            .getFilter(`name eq '${cpName}'`)
            .then((cpData) => {
              return {
                definition: cpData[0] as ICustomPropertyCondensed,
                value: cpValue,
              } as ICustomPropertyObject;
            });
        })
      );
    }
  }

  async updateTags() {
    if (this.arg.tags && this.arg.tags.length == 0) this.obj.tags = [];
    if (this.arg.tags && this.arg.tags.length > 0) {
      this.obj.tags = await Promise.all<ITagCondensed>(
        this.arg.tags.map(async (tag) => {
          return await this.tag
            .getFilter(`name eq '${tag}'`)
            .then((tagsData) => tagsData[0] as ITagCondensed);
        })
      );
    }
  }

  async updateModifiedTimeStamp() {
    this.obj.modifiedDate = modifiedDateTime();
  }

  async updateOwner() {
    if ((this.arg as IAppUpdate).owner) {
      let [userDirectory, userId] = (this.arg as IAppUpdate).owner.split("\\");

      this.obj.owner = await this.user
        .getFilter(
          `userId  eq '${userId}' and userDirectory eq '${userDirectory}'`
        )
        .then((u) => u[0]);
    }
  }

  async updateAppStream() {
    if ((this.arg as IAppUpdate).stream) {
      this.obj.stream = await this.stream
        .getFilter(`name eq '${(this.arg as IAppUpdate).stream}'`)
        .then((streams) => streams[0]);
    }
  }

  async updateAll() {
    await Promise.all([
      this.updateModifiedTimeStamp(),
      this.updateCustomProperties(),
      this.updateTags(),
      this.updateOwner(),
      this.updateAppStream(),
    ]);

    return this.obj;
  }
}
