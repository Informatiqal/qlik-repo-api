import { IHttpStatus } from "./types/interfaces";
import { QlikRepositoryClient } from "qlik-rest-api";

export type TCertificateExportFormat = "Windows" | "Pem;";
export interface ICertificateExportParameters {
  machineNames: string[];
  certificatePassword?: string;
  includeSecretsKey?: boolean;
  exportFormat?: TCertificateExportFormat;
  includeCa?: boolean;
}

export interface IClassCertificate {
  distributionPathGet(): Promise<string>;
  export(arg: ICertificateExportParameters): Promise<IHttpStatus>;
}

export class Certificate implements IClassCertificate {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async distributionPathGet() {
    return await this.repoClient
      .Get(`certificatedistribution/exportcertificatespath`)
      .then((res) => {
        return res.data as string;
      });
  }

  public async export(arg: ICertificateExportParameters) {
    if (!arg.machineNames)
      throw new Error(
        `certificate.export: "machineNames" parameter is required`
      );

    let data: { [k: string]: any } = {};
    data["machineNames"] = arg.machineNames;

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
