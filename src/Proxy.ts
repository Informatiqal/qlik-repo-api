import { QlikRepositoryClient } from "qlik-rest-api";
import {
  IUpdateObjectOptions,
  IProxyService,
  IProxyUpdate,
  IVirtualProxyConfigCondensed,
  IUpdateProxyOptions,
} from "./types/interfaces";
import { AddRemoveSet } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassProxy {
  update(
    arg: IProxyUpdate,
    options?: IUpdateObjectOptions
  ): Promise<IProxyService>;
  details: IProxyService;
}

export class Proxy implements IClassProxy {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: IProxyService;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: IProxyService
  ) {
    if (!id) throw new Error(`proxy.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<IProxyService>(`proxyService/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async update(arg: IProxyUpdate, options?: IUpdateProxyOptions) {
    this.validateRanges(arg);

    if (arg.listenPort) this.details.settings.listenPort = arg.listenPort;
    if (arg.unencryptedListenPort)
      this.details.settings.unencryptedListenPort = arg.unencryptedListenPort;
    if (arg.authenticationListenPort)
      this.details.settings.authenticationListenPort =
        arg.authenticationListenPort;
    if (arg.unencryptedAuthenticationListenPort)
      this.details.settings.unencryptedAuthenticationListenPort =
        arg.unencryptedAuthenticationListenPort;
    if (arg.keepAliveTimeoutSeconds)
      this.details.settings.keepAliveTimeoutSeconds =
        arg.keepAliveTimeoutSeconds;
    if (arg.maxHeaderSizeBytes)
      this.details.settings.maxHeaderSizeBytes = arg.maxHeaderSizeBytes;
    if (arg.maxHeaderLines)
      this.details.settings.maxHeaderLines = arg.maxHeaderLines;
    if (arg.restListenPort)
      this.details.settings.restListenPort = arg.restListenPort;
    if (arg.allowHttp) this.details.settings.allowHttp = arg.allowHttp;
    if (arg.sslBrowserCertificateThumbprint)
      this.details.settings.sslBrowserCertificateThumbprint =
        arg.sslBrowserCertificateThumbprint;
    if (arg.kerberosAuthentication)
      this.details.settings.kerberosAuthentication = arg.kerberosAuthentication;
    if (!arg.virtualProxies) this.details.settings.virtualProxies = [];
    if (arg.virtualProxies)
      AddRemoveSet(
        options?.virtualProxyOperation,
        this.details.settings.virtualProxies,
        arg.virtualProxies
      );

    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Post<IProxyService>(`proxyservice/${this.details.id}`, {
        ...this.details,
      })
      .then((res) => res.data);
  }

  private validateRanges(arg: IProxyUpdate) {
    if (arg.listenPort < 1 && arg.listenPort > 65536)
      throw new Error(
        `proxy.update: "listerPort" must be between 1 and 655536`
      );
    if (arg.unencryptedListenPort < 1 && arg.unencryptedListenPort > 65536)
      throw new Error(
        `proxy.update: "unencryptedListenPort" must be between 1 and 655536`
      );
    if (
      arg.authenticationListenPort < 1 &&
      arg.authenticationListenPort > 65536
    )
      throw new Error(
        `proxy.update: "authenticationListenPort" must be between 1 and 655536`
      );
    if (
      arg.unencryptedAuthenticationListenPort < 1 &&
      arg.unencryptedAuthenticationListenPort > 65536
    )
      throw new Error(
        `proxy.update: "unencryptedAuthenticationListenPort" must be between 1 and 655536`
      );
    if (arg.keepAliveTimeoutSeconds < 1 && arg.keepAliveTimeoutSeconds > 300)
      throw new Error(
        `proxy.update: "keepAliveTimeoutSeconds" must be between 1 and 300`
      );
    if (arg.maxHeaderSizeBytes < 512 && arg.maxHeaderSizeBytes > 131072)
      throw new Error(
        `proxy.update: "maxHeaderSizeBytes" must be between 512 and 131072`
      );
    if (arg.maxHeaderLines < 20 && arg.maxHeaderLines > 1000)
      throw new Error(
        `proxy.update: "maxHeaderLines" must be between 20 and 1000`
      );
    if (arg.restListenPort < 1 && arg.restListenPort > 65536)
      throw new Error(
        `proxy.update: "restListenPort" must be between 1 and 655536`
      );
  }

  // TODO: returning IVirtualProxyConfigCondensed[] but it should be IProxyService[]?
  private async parseVirtualProxies(
    vpArg: string[]
  ): Promise<IVirtualProxyConfigCondensed[]> {
    let allVP = await this.#repoClient.Get<IVirtualProxyConfigCondensed[]>(
      `proxyservice/full`
    );
    let vpToAdd = allVP.data.filter((v: any) => {
      return vpArg.includes(v.prefix);
    });
    return vpToAdd;
  }
}
