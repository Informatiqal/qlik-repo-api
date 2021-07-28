import { modifiedDateTime } from "./generic";

import { ICustomPropertyObject } from "../types/interfaces";

import { ICustomPropertyCondensed } from "../CustomProperty";
import { IAppUpdate } from "../App";
import { ITagCondensed } from "../Tag";

import { ITaskCreate } from "../Task.interface";

import { IUserUpdate } from "../User";
import { IStreamUpdate } from "../Stream";
import { ISystemRuleCreate } from "../SystemRule.interface";

export class UpdateCommonProperties {
  private qlikUtil: any;
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
  }

  async updateCustomProperties() {
    if (this.arg.customProperties && this.arg.customProperties.length == 0)
      this.obj.customProperties = [];
    if (this.arg.customProperties && this.arg.customProperties.length > 0) {
      this.obj.customProperties = await Promise.all<ICustomPropertyObject>(
        this.arg.customProperties.map(async (customProperty) => {
          let [cpName, cpValue] = customProperty.split("=");
          return await this.qlikUtil
            .customPropertyGetFilter(`name eq '${cpName}'`)
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
          return await this.qlikUtil
            .tagGetFilter(`name eq '${tag}'`)
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

      this.obj.owner = await this.qlikUtil
        .userGetFilter(
          `userId  eq '${userId}' and userDirectory eq '${userDirectory}'`
        )
        .then((u) => u[0]);
    }
  }

  async updateAppStream() {
    if ((this.arg as IAppUpdate).stream) {
      this.obj.stream = await this.qlikUtil
        .streamGetFilter(`name eq '${(this.arg as IAppUpdate).stream}'`)
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
