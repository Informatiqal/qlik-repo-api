import { QlikRepositoryClient } from "qlik-rest-api";
import { modifiedDateTime } from "./util/generic";

import { IHttpReturn } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import {
  IAccessTypeInfo,
  ILicense,
  ILicenseAccessTypeCondensed,
  IAudit,
  ILicenseAccessGroup,
  IAuditParameters,
  ILicenseSetKey,
  ILicenseSetSerial,
} from "./types/interfaces";

export type TAccessType = "Analyzer" | "Professional" | "Login" | "User";

export interface IClassLicense {
  accessTypeInfoGet(): Promise<IAccessTypeInfo>;
  get(): Promise<ILicense>;
  setSerial(arg: ILicenseSetSerial): Promise<ILicense>;
  setKey(arg: ILicenseSetKey): Promise<ILicense>;
  accessTypeGet(arg: {
    accessType: TAccessType;
    id?: string;
  }): Promise<ILicenseAccessTypeCondensed[]>;
  auditGet(arg: IAuditParameters): Promise<IAudit>;
  accessTypeRemove(arg: {
    accessType: TAccessType;
    id: string;
  }): Promise<IHttpStatus>;
  accessGroupCreate(arg: {
    accessType: TAccessType;
    name: string;
  }): Promise<ILicenseAccessGroup>;
}

export class License implements IClassLicense {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async accessTypeInfoGet() {
    return await this.#repoClient
      .Get<IAccessTypeInfo>(`license/accesstypeinfo`)
      .then((res) => {
        return res.data;
      });
  }

  public async get() {
    return await this.#repoClient.Get<ILicense>(`license`).then((res) => {
      return res.data;
    });
  }

  public async setSerial(arg: ILicenseSetSerial) {
    let url = `license`;

    let data: { [k: string]: any } = {};

    data["name"] = arg.name;
    data["organization"] = arg.organization || "";

    let method: "Post" | "Put";

    let currentLicense = await this.get();
    if (currentLicense.key != "")
      throw new Error(
        `license.setSerial: Downgrading from Signed License is not supported by Qlik Sense APIs`
      );

    if (!currentLicense) method = "Post";

    if (currentLicense) {
      method = "Put";
      data["id"] = currentLicense.id;
      data["modifiedDate"] = modifiedDateTime();
      url += `/${currentLicense.id}`;
    }

    data["serial"] = arg.serial;
    data["lef"] = arg.lef;

    url += `?control=${arg.control}`;

    return await this.#repoClient[method]<ILicense>(url, data).then((res) => {
      return res.data;
    });
  }

  public async setKey(arg: ILicenseSetKey) {
    let url = `license`;

    let data: { [k: string]: any } = {};

    data["name"] = arg.name;
    data["organization"] = arg.organization || "";

    let method: "Post" | "Put";

    let currentLicense = await this.get();
    if (!currentLicense) method = "Post";
    if (currentLicense) {
      method = "Put";
      data["id"] = currentLicense.id;
      data["modifiedDate"] = modifiedDateTime();
      url += `/${currentLicense.id}`;
    }

    data["key"] = arg.key;

    return await this.#repoClient[method]<ILicense>(url, data).then((res) => {
      return res.data;
    });
  }

  public async auditGet(arg: IAuditParameters) {
    let data = { ...arg };

    if (arg.resourceId) data.resourceFilter = `id eq ${arg.resourceId}`;

    return await this.#repoClient
      .Post<IAudit>(`systemrule/license/audit`, data)
      .then((res) => res.data);
  }

  public async accessTypeGet(arg: { accessType: TAccessType; id?: string }) {
    let url = `license/${arg.accessType}AccessType`;
    if (arg.id) url += `/${arg.id}`;

    return await this.#repoClient
      .Get<ILicenseAccessTypeCondensed[]>(url)
      .then((res: IHttpReturn) => {
        if (res.data.length > 0) return res.data;

        return [res.data];
      });
  }

  public async accessTypeRemove(arg: { accessType: TAccessType; id: string }) {
    if (!arg.id)
      throw new Error(
        `license.accessTypeRemoveLogin: "id" parameter is required`
      );

    let url = `license/${arg.accessType}AccessType/${arg.id}`;

    return await this.#repoClient
      .Delete(url)
      .then((res: IHttpReturn) => res.status);
  }

  public async accessGroupCreate(arg: {
    accessType: TAccessType;
    name: string;
  }) {
    if (!arg.name)
      throw new Error(
        `license.accessGroupCreateUser: "name" parameter is required`
      );

    return await this.#repoClient
      .Post<ILicenseAccessGroup>(`license/${arg.accessType}AccessGroup`, {
        name: arg.name,
      })
      .then((res) => {
        return res.data;
      });
  }
}
