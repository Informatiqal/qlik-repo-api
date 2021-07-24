import { QlikRepoApi } from "./main";
import { modifiedDateTime } from "./util/generic";

import {
  IAccessTypeInfo,
  ILicense,
  ILicenseAccessTypeCondensed,
  IHttpReturn,
  IAudit,
  IHttpStatus,
  ILicenseAccessGroup,
} from "./interfaces";

import {
  IAuditParameters,
  ILicenseSetKey,
  ILicenseSetSerial,
} from "./interfaces/argument.interface";

export class License {
  constructor() {}

  public async licenseAccessTypeInfoGet(
    this: QlikRepoApi
  ): Promise<IAccessTypeInfo> {
    return await this.repoClient.Get(`license/accesstypeinfo`).then((res) => {
      return res.data as IAccessTypeInfo;
    });
  }

  public async licenseGet(this: QlikRepoApi): Promise<ILicense> {
    return await this.repoClient.Get(`license`).then((res) => {
      return res.data as ILicense;
    });
  }

  public async licenseSetSerial(
    this: QlikRepoApi,
    arg: ILicenseSetSerial
  ): Promise<ILicense> {
    let url = `license`;

    let data = {
      name: arg.name,
      organization: arg.organization || "",
    };

    let method: "Post" | "Put";

    let currentLicense = await this.licenseGet();
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

  public async licenseSetKey(
    this: QlikRepoApi,
    arg: ILicenseSetKey
  ): Promise<ILicense> {
    let url = `license`;

    let data = {
      name: arg.name,
      organization: arg.organization || "",
    };

    let method: "Post" | "Put";

    let currentLicense = await this.licenseGet();
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

  public async licenseAnalyzerAccessTypeGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<ILicenseAccessTypeCondensed[]> {
    return await getAccessType(this, "analyzer", id);
  }

  public async licenseProfessionalAccessTypeGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<ILicenseAccessTypeCondensed[]> {
    return await getAccessType(this, "professional", id);
  }

  public async licenseUserAccessTypeGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<ILicenseAccessTypeCondensed[]> {
    return await getAccessType(this, "user", id);
  }

  public async licenseLoginAccessTypeGet(
    this: QlikRepoApi,
    id?: string
  ): Promise<ILicenseAccessTypeCondensed[]> {
    return await getAccessType(this, "login", id);
  }

  public async licenseAuditGet(
    this: QlikRepoApi,
    arg: IAuditParameters
  ): Promise<IAudit> {
    let data = { ...arg };

    if (arg.resourceId) data.resourceFilter = `id eq ${arg.resourceId}`;

    return await this.repoClient
      .Post(`systemrule/license/audit`, data)
      .then((res) => res.data as IAudit);
  }

  public async licenseLoginAccessTypeRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpStatus> {
    if (!id)
      throw new Error(
        `licenseLoginAccessTypeRemove: "id" parameter is required`
      );
    return await removeAccessType(this, "login", id);
  }

  public async licenseAnalyzerAccessTypeRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpStatus> {
    if (!id)
      throw new Error(
        `licenseAnalyzerAccessTypeRemove: "id" parameter is required`
      );
    return await removeAccessType(this, "analyzer", id);
  }

  public async licenseProfessionalAccessTypeRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpStatus> {
    if (!id)
      throw new Error(
        `licenseProfessionalAccessTypeRemove: "id" parameter is required`
      );
    return await removeAccessType(this, "professional", id);
  }

  public async licenseUserAccessTypeRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpStatus> {
    if (!id)
      throw new Error(
        `licenseUserAccessTypeRemove: "id" parameter is required`
      );
    return await removeAccessType(this, "user", id);
  }

  public async licenseProfessionalAccessGroupCreate(
    this: QlikRepoApi,
    name: string
  ): Promise<ILicenseAccessGroup> {
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

  public async licenseUserAccessGroupCreate(
    this: QlikRepoApi,
    name: string
  ): Promise<ILicenseAccessGroup> {
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
}

async function getAccessType(
  repo: QlikRepoApi,
  licenseType: string,
  id: string
): Promise<ILicenseAccessTypeCondensed[]> {
  let url = `license/${licenseType}AccessType`;
  if (id) url += `/${id}`;

  return await repo.repoClient.Get(url).then((res: IHttpReturn) => {
    if (res.data.length > 0) return res.data as ILicenseAccessTypeCondensed[];

    return [res.data];
  });
}

async function removeAccessType(
  repo: QlikRepoApi,
  licenseType: string,
  id: string
): Promise<IHttpStatus> {
  let url = `license/${licenseType}AccessType/${id}`;

  return await repo.repoClient
    .Delete(url)
    .then((res: IHttpReturn) => res.status);
}
