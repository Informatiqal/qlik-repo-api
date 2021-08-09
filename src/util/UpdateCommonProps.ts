import { modifiedDateTime } from "./generic";

import { QlikRepositoryClient } from "qlik-rest-api";

import {
  CustomProperties,
  IClassCustomProperties,
  ICustomPropertyValue,
} from "../CustomProperties";
import { ICustomPropertyCondensed } from "../CustomProperties";
import { IClassCustomProperty, CustomProperty } from "../CustomProperty";
import { IAppUpdate } from "../App";
import { ITagCondensed, IClassTags, Tags } from "../Tags";
import { ITaskCreate } from "../Task.interface";
import { IUserUpdate, IClassUsers, Users } from "../Users";
import { IStreamUpdate, Streams, IClassStreams } from "../Streams";
import { ISystemRuleCreate } from "../SystemRule.interface";
export class UpdateCommonProperties {
  private qlikUtil: QlikRepositoryClient;
  private customPropertiesClass: IClassCustomProperties;
  private tagsClass: IClassTags;
  private streams: IClassStreams;
  private user: IClassUsers;
  private arg:
    | IUserUpdate
    | IAppUpdate
    | IStreamUpdate
    | ISystemRuleCreate
    | ITaskCreate;
  public obj: any;
  constructor(
    qlikUtil: QlikRepositoryClient,
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
    this.customPropertiesClass = new CustomProperties(this.qlikUtil);
    this.streams = new Streams(this.qlikUtil);
    this.tagsClass = new Tags(this.qlikUtil);
    this.user = new Users(this.qlikUtil);
  }

  async updateCustomProperties() {
    if (this.arg.customProperties && this.arg.customProperties.length == 0)
      this.obj.customProperties = [];
    if (this.arg.customProperties && this.arg.customProperties.length > 0) {
      this.obj.customProperties = await Promise.all<ICustomPropertyValue>(
        this.arg.customProperties.map(async (customProperty) => {
          let [cpName, cpValue] = customProperty.split("=");
          return await this.customPropertiesClass
            .getFilter(`name eq '${cpName}'`)
            .then((cpData) => {
              return {
                definition: cpData[0].details as ICustomPropertyCondensed,
                value: cpValue,
              } as ICustomPropertyValue;
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
          return await this.tagsClass
            .getFilter(`name eq '${tag}'`)
            .then((tagsData) => tagsData[0].details as ITagCondensed);
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
      this.obj.stream = await this.streams
        .getFilter(`name eq '${(this.arg as IAppUpdate).stream}'`)
        .then((streams) => streams[0].details);
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
