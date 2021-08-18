import { QlikRepositoryClient } from "qlik-rest-api";
import { modifiedDateTime } from "./util/generic";

import { IHttpReturn, IHttpStatus } from "./types/interfaces";
import {
  IAccessTypeInfo,
  ILicense,
  ILicenseAccessTypeCondensed,
  IAudit,
  ILicenseAccessGroup,
  IAuditParameters,
  ILicenseSetKey,
  ILicenseSetSerial,
} from "./License.interface";

type TAccessType = "Analyzer" | "Professional" | "Login" | "User";

export interface IClassLicense {
  accessTypeInfoGet(): Promise<IAccessTypeInfo>;
  get(): Promise<ILicense>;
  setSerial(arg: ILicenseSetSerial): Promise<ILicense>;
  setKey(arg: ILicenseSetKey): Promise<ILicense>;
  accessTypeGet(
    accessType: TAccessType,
    id?: string
  ): Promise<ILicenseAccessTypeCondensed[]>;
  auditGet(arg: IAuditParameters): Promise<IAudit>;
  accessTypeRemove(accessType: TAccessType, id: string): Promise<IHttpStatus>;
  accessGroupCreate(
    accessType: TAccessType,
    name: string
  ): Promise<ILicenseAccessGroup>;
}

export class License implements IClassLicense {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async accessTypeInfoGet() {
    return await this.repoClient.Get(`license/accesstypeinfo`).then((res) => {
      return res.data as IAccessTypeInfo;
    });
  }

  public async get() {
    return await this.repoClient.Get(`license`).then((res) => {
      return res.data as ILicense;
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

    return await this.repoClient[method](url, data).then((res) => {
      return res.data as ILicense;
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

    return await this.repoClient[method](url, data).then((res) => {
      return res.data as ILicense;
    });
  }

  public async auditGet(arg: IAuditParameters) {
    let data = { ...arg };

    if (arg.resourceId) data.resourceFilter = `id eq ${arg.resourceId}`;

    return await this.repoClient
      .Post(`systemrule/license/audit`, data)
      .then((res) => res.data as IAudit);
  }

  public async accessTypeGet(accessType: TAccessType, id?: string) {
    let url = `license/${accessType}AccessType`;
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res: IHttpReturn) => {
      if (res.data.length > 0) return res.data as ILicenseAccessTypeCondensed[];

      return [res.data];
    });
  }

  public async accessTypeRemove(accessType: TAccessType, id: string) {
    if (!id)
      throw new Error(
        `license.accessTypeRemoveLogin: "id" parameter is required`
      );

    let url = `license/${accessType}AccessType/${id}`;

    return await this.repoClient
      .Delete(url)
      .then((res: IHttpReturn) => res.status);
  }

  public async accessGroupCreate(accessGroup: TAccessType, name: string) {
    if (!name)
      throw new Error(
        `license.accessGroupCreateUser: "name" parameter is required`
      );

    return await this.repoClient
      .Post(`license/${accessGroup}AccessGroup`, { name })
      .then((res) => {
        return res.data as ILicenseAccessGroup;
      });
  }
}
