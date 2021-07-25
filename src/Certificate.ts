import { QlikRepoApi } from "./main";

import { ICertificateExportParameters } from "./interfaces/argument.interface";
import { IHttpStatus } from "./interfaces";

export class Certificate {
  constructor() {}

  public async certificateDistributionPathGet(
    this: QlikRepoApi
  ): Promise<string> {
    return await this.repoClient
      .Get(`certificatedistribution/exportcertificatespath`)
      .then((res) => {
        return res.data as string;
      });
  }

  public async certificateExport(
    this: QlikRepoApi,
    arg: ICertificateExportParameters
  ): Promise<IHttpStatus> {
    if (!arg.machineNames)
      throw new Error(
        `certificateExport: "machineNames" parameter is required`
      );

    let data = {
      machineNames: arg.machineNames,
    };

    if (arg.certificatePassword)
      data["certificatePassword"] = arg.certificatePassword;
    if (arg.includeSecretsKey)
      data["includeSecretsKey"] = arg.includeSecretsKey;
    if (arg.includeCa) data["includeCa"] = arg.includeCa;
    if (arg.exportFormat) data["exportFormat"] = arg.exportFormat;

    return await this.repoClient
      .Post(`certificatedistribution/exportcertificates`, data)
      .then((res) => {
        return res.status;
      });
  }
}
