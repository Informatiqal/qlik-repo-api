import { QlikRepositoryClient } from "qlik-rest-api";
import {
  ILoadBalancingNodeResult,
  ILoadBalancingRequest,
  ILoadBalancingResult,
} from "./types/interfaces";

export class LoadBalancing {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async validEngines(arg: ILoadBalancingRequest) {
    if (!arg.appID)
      throw new Error(
        `loadBalancing.validEngined: "appID" parameter is required`
      );

    if (!arg.loadBalancingPurpose)
      throw new Error(
        `loadBalancing.validEngined: "loadBalancingPurpose" parameter is required`
      );

    return await this.#repoClient
      .Post<ILoadBalancingResult>(`/loadbalancing/validengines`, arg)
      .then((res) => res.data);
  }

  public async validNodes(arg: ILoadBalancingRequest) {
    if (!arg.appID)
      throw new Error(
        `loadBalancing.validNodes: "appID" parameter is required`
      );

    if (!arg.loadBalancingPurpose)
      throw new Error(
        `loadBalancing.validNodes: "loadBalancingPurpose" parameter is required`
      );

    return await this.#repoClient
      .Post<ILoadBalancingNodeResult>(`/loadbalancing/validnodes`, arg)
      .then((res) => res.data);
  }

  /**
   * EXPERIMENTAL
   *
   * This API is under development. Do not rely on it. It may change or be removed in future versions.
   */
  public async validNodesExtended(arg: ILoadBalancingRequest) {
    if (!arg.appID)
      throw new Error(
        `loadBalancing.validNodesExtended: "appID" parameter is required`
      );

    if (!arg.loadBalancingPurpose)
      throw new Error(
        `loadBalancing.validNodesExtended: "loadBalancingPurpose" parameter is required`
      );

    return await this.#repoClient
      .Post<ILoadBalancingNodeResult>(`/loadbalancing/validnodes/extended`, arg)
      .then((res) => res.data);
  }
}
