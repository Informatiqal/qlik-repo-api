import { QlikRepositoryClient } from "./main";
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

export interface IClassLicense {
  accessTypeInfoGet(): Promise<IAccessTypeInfo>;
  get(): Promise<ILicense>;
  setSerial(arg: ILicenseSetSerial): Promise<ILicense>;
  setKey(arg: ILicenseSetKey): Promise<ILicense>;
  accessTypeGetAnalyzer(id?: string): Promise<ILicenseAccessTypeCondensed[]>;
  accessTypeGetProfessional(
    id?: string
  ): Promise<ILicenseAccessTypeCondensed[]>;
  accessTypeGetUser(id?: string): Promise<ILicenseAccessTypeCondensed[]>;
  accessTypeGetLogin(id?: string): Promise<ILicenseAccessTypeCondensed[]>;
  auditGet(arg: IAuditParameters): Promise<IAudit>;
  accessTypeRemoveLogin(id: string): Promise<IHttpStatus>;
  accessTypeRemoveAnalyzer(id: string): Promise<IHttpStatus>;
  accessTypeRemoveProfessional(id: string): Promise<IHttpStatus>;
  accessTypeRemoveUser(id: string): Promise<IHttpStatus>;
  accessGroupCreateProfessional(name: string): Promise<ILicenseAccessGroup>;
  accessGroupCreateUser(name: string): Promise<ILicenseAccessGroup>;
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

    let data = {
      name: arg.name,
      organization: arg.organization || "",
    };

    let method: "Post" | "Put";

    let currentLicense = await this.get();
    if (currentLicense.key != "")
      throw new Error(
        `licenseSetSerial: Downgrading from Signed License is not supported by Qlik Sense APIs`
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

    let data = {
      name: arg.name,
      organization: arg.organization || "",
    };

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

  public async accessTypeGetAnalyzer(id?: string) {
    return await this.getAccessType("analyzer", id);
  }

  public async accessTypeGetProfessional(id?: string) {
    return await this.getAccessType("professional", id);
  }

  public async accessTypeGetUser(id?: string) {
    return await this.getAccessType("user", id);
  }

  public async accessTypeGetLogin(id?: string) {
    return await this.getAccessType("login", id);
  }

  public async auditGet(arg: IAuditParameters) {
    let data = { ...arg };

    if (arg.resourceId) data.resourceFilter = `id eq ${arg.resourceId}`;

    return await this.repoClient
      .Post(`systemrule/license/audit`, data)
      .then((res) => res.data as IAudit);
  }

  public async accessTypeRemoveLogin(id: string) {
    if (!id)
      throw new Error(
        `licenseLoginAccessTypeRemove: "id" parameter is required`
      );
    return await this.removeAccessType("login", id);
  }

  public async accessTypeRemoveAnalyzer(id: string) {
    if (!id)
      throw new Error(
        `licenseAnalyzerAccessTypeRemove: "id" parameter is required`
      );
    return await this.removeAccessType("analyzer", id);
  }

  public async accessTypeRemoveProfessional(id: string) {
    if (!id)
      throw new Error(
        `licenseProfessionalAccessTypeRemove: "id" parameter is required`
      );
    return await this.removeAccessType("professional", id);
  }

  public async accessTypeRemoveUser(id: string) {
    if (!id)
      throw new Error(
        `licenseUserAccessTypeRemove: "id" parameter is required`
      );
    return await this.removeAccessType("user", id);
  }

  public async accessGroupCreateProfessional(name: string) {
    if (!name)
      throw new Error(
        `licenseProfessionalAccessGroupCreate: "name" parameter is required`
      );
    return await this.repoClient
      .Post(`license/ProfessionalAccessGroup`, { name })
      .then((res) => {
        return res.data as ILicenseAccessGroup;
      });
  }

  public async accessGroupCreateUser(name: string) {
    if (!name)
      throw new Error(
        `licenseUserAccessGroupCreate: "name" parameter is required`
      );

    return await this.repoClient
      .Post(`license/UserAccessGroup`, { name })
      .then((res) => {
        return res.data as ILicenseAccessGroup;
      });
  }

  private async getAccessType(
    licenseType: string,
    id: string
  ): Promise<ILicenseAccessTypeCondensed[]> {
    let url = `license/${licenseType}AccessType`;
    if (id) url += `/${id}`;

    return await this.repoClient.Get(url).then((res: IHttpReturn) => {
      if (res.data.length > 0) return res.data as ILicenseAccessTypeCondensed[];

      return [res.data];
    });
  }

  private async removeAccessType(
    licenseType: string,
    id: string
  ): Promise<IHttpStatus> {
    let url = `license/${licenseType}AccessType/${id}`;

    return await this.repoClient
      .Delete(url)
      .then((res: IHttpReturn) => res.status);
  }
}
