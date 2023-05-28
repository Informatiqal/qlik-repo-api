import { modifiedDateTime } from "./generic";
import { QlikRepositoryClient } from "qlik-rest-api";
import { CustomProperties, IClassCustomProperties } from "../CustomProperties";
import { IClassTags, Tags } from "../Tags";
import {
  ITaskCreate,
  IUserUpdate,
  IAppUpdate,
  ITagCondensed,
  ICustomPropertyCondensed,
  IStreamUpdate,
  ISystemRuleCreate,
  ICustomPropertyValue,
  TAddRemoveSet,
} from "../types/interfaces";
export class UpdateCommonProperties<T> {
  private qlikUtil: QlikRepositoryClient;
  private customPropertiesClass: IClassCustomProperties;
  private tagsClass: IClassTags;
  private arg:
    | IUserUpdate
    | IAppUpdate
    | IStreamUpdate
    | ISystemRuleCreate
    | ITaskCreate;
  public obj: any;
  private customPropertyOperation?: TAddRemoveSet;
  private tagOperation?: TAddRemoveSet;
  // private options: {
  //   test?: string;
  //   customPropertyOperation?: TAddRemoveSet;
  //   tagOperation?: TAddRemoveSet;
  // };
  private tagsPath = "tags";
  private customPropertiesPath = "customProperties";
  constructor(
    qlikUtil: QlikRepositoryClient,
    obj: T,
    arg:
      | IUserUpdate
      | IAppUpdate
      | IStreamUpdate
      | ISystemRuleCreate
      | ITaskCreate,
    options?: {
      test?: string;
      customPropertyOperation?: TAddRemoveSet;
      tagOperation?: TAddRemoveSet;
    }
  ) {
    this.qlikUtil = qlikUtil;
    this.obj = obj;
    this.arg = arg;
    // this.options = options;
    this.customPropertiesClass = new CustomProperties(this.qlikUtil);
    this.tagsClass = new Tags(this.qlikUtil);

    if (!options) {
      this.customPropertyOperation = "set";
      this.tagOperation = "set";
    }

    if (options) {
      this.customPropertyOperation = options.hasOwnProperty(
        "customPropertyOperation"
      )
        ? options.customPropertyOperation
        : "set";

      this.tagOperation = options.hasOwnProperty("tagOperation")
        ? options.tagOperation
        : "set";

      if (options.test) {
        this.tagsPath = `${options.test}}.${this.tagsPath}`;
        this.customPropertiesPath = `${options.test}}.${this.customPropertiesPath}`;
      }
    }
  }

  async updateCustomProperties() {
    if (this.arg.customProperties && this.arg.customProperties.length == 0)
      this.obj = this.setProperty(this.obj, "customProperties", []);
    // this.obj.customProperties = [];
    if (this.arg.customProperties && this.arg.customProperties.length > 0) {
      // overwriting the existing (if any) custom properties
      if (this.customPropertyOperation == "set") {
        // get the custom properties values
        // if the custom property do not exists - throw an error
        const c = await Promise.all<ICustomPropertyValue>(
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

        this.obj = this.setProperty(this.obj, this.customPropertiesPath, c);
      }

      // append the values to the existing (if any) custom properties (no duplications)
      if (this.customPropertyOperation == "add") {
        //get the values for the existing custom properties in the object
        const existingCustomPropsData = this.getProperty(
          this.customPropertiesPath,
          this.obj
        );

        const existingValues: string[] = existingCustomPropsData.map(
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

      if (this.customPropertyOperation == "remove") {
        this.obj.customProperties = (
          this.obj.customProperties as ICustomPropertyValue[]
        ).filter(
          (t) =>
            !this.arg.customProperties.includes(
              `${t.definition.name}=${t.value}`
            )
        );
      }
    }
  }

  async updateTags() {
    if (this.arg.tags && this.arg.tags.length == 0) {
      this.obj = this.setProperty(this.obj, "tags", []);
    }

    if (this.arg.tags && this.arg.tags.length > 0) {
      // overwriting the existing (if any) tags
      if (this.tagOperation == "set") {
        // get the tags objects for the tags that to be added
        // if the tag do not exists - throw an error
        // this.obj.tags =
        const t = await Promise.all<ITagCondensed>(
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

        this.obj = this.setProperty(this.obj, this.tagsPath, t);
      }

      // append the values to the existing (if any) tags (no duplications)
      if (this.tagOperation == "add") {
        //get the values for the existing tags in the object
        // this.obj = this.setProperty(this.obj, this.tagsPath, t);
        const existingTagsData = this.getProperty(this.tagsPath, this.obj);

        const existingValues: string[] = existingTagsData.map(
          (tag) => tag.name
        );
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

      // remove the provided tags from the existing ones
      if (this.tagOperation == "remove") {
        this.obj.tags = this.obj.tags.filter(
          (t) => !this.arg.tags.includes(t.name)
        );
      }
    }
  }

  async updateModifiedTimeStamp() {
    this.obj.modifiedDate = modifiedDateTime();
  }

  async updateOwner() {
    let [userDirectory, userId] = (this.arg as IAppUpdate).owner.split("\\");

    const filter = `userId  eq '${userId}' and userDirectory eq '${userDirectory}'`;

    this.obj.owner = this.qlikUtil
      .Get(`user/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data[0]);
  }

  async updateAppStream() {
    const filter = `name eq '${(this.arg as IAppUpdate).stream}'`;

    this.obj.stream = await this.qlikUtil
      .Get(`stream/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data[0]);
  }

  async updateAll<T>(): Promise<T> {
    const promises = [];
    if ((this.arg as IAppUpdate).stream) promises.push(this.updateAppStream());
    if ((this.arg as IAppUpdate).owner) promises.push(this.updateOwner());
    if (this.arg.customProperties) promises.push(this.updateCustomProperties());
    if (this.arg.tags) promises.push(this.updateTags());

    promises.push(this.updateModifiedTimeStamp());

    await Promise.all(promises);

    return this.obj;
  }

  private setProperty(obj, path, value) {
    const [head, ...rest] = path.split(".");

    return {
      ...obj,
      [head]: rest.length
        ? this.setProperty(obj[head], rest.join("."), value)
        : value,
    };
  }

  private getProperty(path, obj = self, separator = ".") {
    var properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => prev?.[curr], obj);
  }
}
