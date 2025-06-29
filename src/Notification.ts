import { QlikRepositoryClient } from "qlik-rest-api";
import {
  ChangesSinceOutputCondensed,
  INotificationCreate,
} from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { URLBuild } from "./util/generic";

export interface IClassNotifications {
  create(arg: INotificationCreate): Promise<string>;
  remove(arg: { handle: string }): Promise<IHttpStatus>;
  changes(arg: {
    since: string;
    types: string;
  }): Promise<ChangesSinceOutputCondensed[]>;
}

export class Notification implements IClassNotifications {
  #repoClient: QlikRepositoryClient;
  constructor(repoClient: QlikRepositoryClient) {
    this.#repoClient = repoClient;
  }

  async create(arg: INotificationCreate) {
    if (!arg.name)
      throw new Error(`notifications.create: "name" parameter is required`);
    if (!arg.uri)
      throw new Error(`notifications.create: "uri" parameter is required`);

    const urlBuild = new URLBuild(`notification`);

    const changeTypes = {
      Add: 1,
      Update: 2,
      Delete: 3,
    };

    urlBuild.addParam("name", arg.name);

    if (arg.changeType) {
      if (!changeTypes[arg.changeType])
        throw new Error(
          `notifications.create: "${arg.changeType}" is not a valid value. Valid values are Add, Update or Delete`
        );
      urlBuild.addParam("changeType", changeTypes[arg.changeType]);
    }
    if (arg.filter) urlBuild.addParam("filter", arg.filter);
    if (arg.propertyName) urlBuild.addParam("propertyName", arg.propertyName);
    if (arg.condition) urlBuild.addParam("condition", arg.condition);

    const url = urlBuild.getUrl();

    return await this.#repoClient
      .Post<any>(url, `${arg.uri}`, "application/json")
      .then((res) => res.data.value);
  }

  async remove(arg: { handle: string }) {
    if (!arg.handle)
      throw new Error(`notifications.remove: "handle" parameter is required`);

    return await this.#repoClient
      .Delete(`notification?handle=${arg.handle}`)
      .then((res) => res.status);
  }

  async changes(arg: { since: string; types: string }) {
    if (!arg.since)
      throw new Error(`notifications.remove: "since" parameter is required`);
    if (!arg.types)
      throw new Error(`notifications.remove: "types" parameter is required`);

    const urlBuild = new URLBuild(`notification/changes`);
    urlBuild.addParam("since", arg.since);
    urlBuild.addParam("types", arg.types);

    return await this.#repoClient
      .Get<any>(urlBuild.getUrl())
      .then((res) => res.data);
  }
}
