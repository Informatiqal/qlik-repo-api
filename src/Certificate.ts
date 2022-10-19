import { ICertificateExportParameters } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { QlikRepositoryClient } from "qlik-rest-api";

export interface IClassCertificate {
  distributionPathGet(): Promise<string>;
  generate(arg: ICertificateExportParameters): Promise<IHttpStatus>;
}

export class Certificate implements IClassCertificate {
  #repoClient: QlikRepositoryClient;
  constructor(repoClient: QlikRepositoryClient) {
    this.#repoClient = repoClient;
  }

  public async distributionPathGet() {
    return await this.#repoClient
      .Get<string>(`certificatedistribution/exportcertificatespath`)
      .then((res) => {
        return res.data;
      });
  }

  public async generate(arg: ICertificateExportParameters) {
    if (!arg.machineNames)
      throw new Error(
        `certificate.generate: "machineNames" parameter is required`
      );

    let data: { [k: string]: any } = {};
    data["machineNames"] = arg.machineNames;

    if (arg.certificatePassword)
      data["certificatePassword"] = arg.certificatePassword;
    if (arg.includeSecretsKey)
      data["includeSecretsKey"] = arg.includeSecretsKey;
    if (arg.includeCa) data["includeCa"] = arg.includeCa;
    if (arg.exportFormat) data["exportFormat"] = arg.exportFormat;

    return await this.#repoClient
      .Post(`certificatedistribution/exportcertificates`, data)
      .then((res) => {
        return res.status;
      });
  }
}
