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
  private appendCustomProps: boolean;
  private appendTags: boolean;
  constructor(
    qlikUtil: QlikRepositoryClient,
    obj: any,
    arg:
      | IUserUpdate
      | IAppUpdate
      | IStreamUpdate
      | ISystemRuleCreate
      | ITaskCreate,
    options?: { appendCustomProps?: boolean; appendTags?: boolean }
  ) {
    this.qlikUtil = qlikUtil;
    this.obj = obj;
    this.arg = arg;
    this.customPropertiesClass = new CustomProperties(this.qlikUtil);
    this.streams = new Streams(this.qlikUtil);
    this.tagsClass = new Tags(this.qlikUtil);
    this.user = new Users(this.qlikUtil);

    if (!options) {
      this.appendCustomProps = false;
      this.appendTags = false;
    }

    if (options) {
      if (options.hasOwnProperty("appendCustomProps")) {
        this.appendCustomProps = options.appendCustomProps;
      } else {
        this.appendCustomProps = options.appendCustomProps;
      }

      if (options.hasOwnProperty("appendTags")) {
        this.appendTags = options.appendTags;
      } else {
        this.appendTags = options.appendTags;
      }
    }
  }

  async updateCustomProperties() {
    if (this.arg.customProperties && this.arg.customProperties.length == 0)
      this.obj.customProperties = [];
    if (this.arg.customProperties && this.arg.customProperties.length > 0) {
      // overwriting the existing (if any) custom properties
      if (this.appendCustomProps == false) {
        // get the custom properties values
        // if the custom property do not exists - throw an error
        this.obj.customProperties = await Promise.all<ICustomPropertyValue>(
          this.arg.customProperties.map(async (customProperty) => {
            let [cpName, cpValue] = customProperty.split("=");
            return await this.customPropertiesClass
              .getFilter({ filter: `name eq '${cpName}'` })
              .then((cpData) => {
                if (cpData.length == 0)
                  throw new Error(
                    `customProperty.get: Custom property with name "${cpName}" do not exists`
                  );

                if (cpData[0].details.choiceValues.includes(cpValue) == false)
                  throw new Error(
                    `customProperty.get: Choice value "${cpValue}" do not exists for custom property "${cpName}"`
                  );

                return {
                  definition: cpData[0].details as ICustomPropertyCondensed,
                  value: cpValue,
                } as ICustomPropertyValue;
              });
          })
        );
      }

      // append the values to the existing (if any) custom properties (no duplications)
      if (this.appendCustomProps == true) {
        //get the values for the existing custom properties in the object
        const existingValues: string[] = this.obj.customProperties.map(
          (cp) => `${cp.definition.name}=${cp.value}`
        );

        // filter out the existing values from the requested values
        const cpValuesToAppend = this.arg.customProperties.filter((argCP) => {
          return existingValues.includes(argCP) == false;
        });

        // get the custom properties objects
        // if the custom property do not exists - throw an error
        const cpToAppend = await Promise.all<ICustomPropertyValue>(
          cpValuesToAppend.map(async (customProperty) => {
            let [cpName, cpValue] = customProperty.split("=");
            return await this.customPropertiesClass
              .getFilter({ filter: `name eq '${cpName}'` })
              .then((cpData) => {
                if (cpData.length == 0)
                  throw new Error(
                    `customProperty.get: Custom property with name "${cpName}" do not exists`
                  );

                if (cpData[0].details.choiceValues.includes(cpValue) == false)
                  throw new Error(
                    `customProperty.get: Choice value "${cpValue}" do not exists for custom property "${cpName}"`
                  );

                return {
                  definition: cpData[0].details as ICustomPropertyCondensed,
                  value: cpValue,
                } as ICustomPropertyValue;
              });
          })
        );

        this.obj.customProperties = [
          ...this.obj.customProperties,
          ...cpToAppend,
        ];
      }
    }
  }

  async updateTags() {
    if (this.arg.tags && this.arg.tags.length == 0) this.obj.tags = [];
    if (this.arg.tags && this.arg.tags.length > 0) {
      // overwriting the existing (if any) tags
      if (this.appendTags == false) {
        // get the tags objects for the tags that to be added
        // if the tag do not exists - throw an error
        this.obj.tags = await Promise.all<ITagCondensed>(
          this.arg.tags.map(async (tag) => {
            return await this.tagsClass
              .getFilter({ filter: `name eq '${tag}'` })
              .then((tagsData) => {
                if (tagsData.length == 0)
                  throw new Error(
                    `tags.get: Tag with name "${tag}" do not exists`
                  );
                return tagsData[0].details as ITagCondensed;
              });
          })
        );
      }

      // append the values to the existing (if any) tags (no duplications)
      if (this.appendTags == true) {
        //get the values for the existing tags in the object
        const existingValues: string[] = this.obj.tags.map((tag) => tag.name);
        // filter out the existing values from the requested values
        const tagsValuesToAppend = this.arg.tags.filter((argTag) => {
          return existingValues.includes(argTag) == false;
        });

        // get the tags objects for the tags that to be added
        // if the tag do not exists - throw an error
        const tagsToAppend = await Promise.all<ITagCondensed>(
          tagsValuesToAppend.map(async (tag) => {
            return await this.tagsClass
              .getFilter({ filter: `name eq '${tag}'` })
              .then((tagsData) => {
                if (tagsData.length == 0)
                  throw new Error(
                    `tags.get: Tag with name "${tag}" do not exists`
                  );
                return tagsData[0].details as ITagCondensed;
              });
          })
        );

        // append the new tags to the existing tags
        this.obj.tags = [...this.obj.tags, ...tagsToAppend];
      }
    }
  }

  async updateModifiedTimeStamp() {
    this.obj.modifiedDate = modifiedDateTime();
  }

  async updateOwner() {
    if ((this.arg as IAppUpdate).owner) {
      let [userDirectory, userId] = (this.arg as IAppUpdate).owner.split("\\");

      this.obj.owner = await this.user
        .getFilter({
          filter: `userId  eq '${userId}' and userDirectory eq '${userDirectory}'`,
        })
        .then((u) => u[0]);
    }
  }

  async updateAppStream() {
    if ((this.arg as IAppUpdate).stream) {
      this.obj.stream = await this.streams
        .getFilter({ filter: `name eq '${(this.arg as IAppUpdate).stream}'` })
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
