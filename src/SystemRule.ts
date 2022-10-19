import { QlikRepositoryClient } from "qlik-rest-api";
import { IUpdateObjectOptions } from "./types/interfaces";
import { IHttpStatus } from "./types/ranges";
import { ISystemRule, ISystemRuleUpdate } from "./types/interfaces";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { calculateActions, getRuleContext } from "./util/generic";

export interface IClassSystemRule {
  remove(): Promise<IHttpStatus>;
  update(arg: ISystemRuleUpdate): Promise<ISystemRule>;
  details: ISystemRule;
}

export class SystemRule implements IClassSystemRule {
  #id: string;
  #repoClient: QlikRepositoryClient;
  details: ISystemRule;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: ISystemRule
  ) {
    if (!id) throw new Error(`systemRules.get: "id" parameter is required`);

    this.#id = id;
    this.#repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.#repoClient
        .Get<ISystemRule>(`systemrule/${this.#id}`)
        .then((res) => res.data);
    }
  }

  public async remove() {
    return await this.#repoClient
      .Delete(`systemrule/${this.#id}`)
      .then((res) => res.status);
  }

  public async update(arg: ISystemRuleUpdate, options?: IUpdateObjectOptions) {
    if (arg.name) this.details.name = arg.name;
    if (arg.rule) this.details.rule = arg.rule;
    if (arg.resourceFilter) this.details.resourceFilter = arg.resourceFilter;
    if (arg.comment) this.details.comment = arg.comment;
    if (arg.disabled) this.details.disabled = arg.disabled;
    if (arg.category) this.details.category = arg.category;
    if (arg.actions) this.details.actions = calculateActions(arg.actions);
    if (arg.context) this.details.ruleContext = getRuleContext(arg.context);

    let updateCommon = new UpdateCommonProperties(
      this.#repoClient,
      this.details,
      arg,
      options
    );
    this.details = await updateCommon.updateAll();

    return await this.#repoClient
      .Put<ISystemRule>(`systemrule/${this.details.id}`, { ...this.details })
      .then((res) => res.data);
  }
}
