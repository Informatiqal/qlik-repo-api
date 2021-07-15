import { QlikRepoApi } from "./main";
import { modifiedDateTime } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { IHttpStatus, IHttpReturnRemove, ISystemRule } from "./interfaces";
import {
  ISystemRuleCreate,
  ISystemRuleUpdate,
} from "./interfaces/argument.interface";

export class SystemRule {
  constructor() {}

  public async ruleGet(this: QlikRepoApi, id: string): Promise<ISystemRule> {
    return await this.repoClient
      .Get(`systemrule/${id}`)
      .then((res) => res.data as ISystemRule);
  }

  public async ruleGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<ISystemRule[]> {
    return await this.repoClient
      .Get(`systemrule?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ISystemRule[]);
  }

  public async ruleCreate(
    this: QlikRepoApi,
    arg: ISystemRuleCreate
  ): Promise<ISystemRule> {
    let rule: ISystemRule = {
      name: arg.name,
      disabled: arg.disabled || false,
      actions: calculateActions(arg.actions),
      ruleContext: arg.context ? getRuleContext(arg.context) : 0,
      category: arg.category || "Security",
      type: "Custom",
      rule: arg.rule || "",
      resourceFilter: arg.resourceFilter || "",
      comment: arg.comment || "",
    };

    if (arg.tags) {
      let updateCommon = new UpdateCommonProperties(this, rule, arg);
      rule = await updateCommon.updateAll();
      delete rule.modifiedDate;
    }

    return await this.repoClient
      .Post(`systemrule`, { ...rule })
      .then((res) => res.data as ISystemRule);
  }

  public async ruleRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    return await this.repoClient.Delete(`systemrule/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async ruleUpdate(
    this: QlikRepoApi,
    arg: ISystemRuleUpdate
  ): Promise<ISystemRule> {
    let rule = await this.ruleGet(arg.id);

    if (arg.name) rule.name = arg.name;
    if (arg.rule) rule.rule = arg.rule;
    if (arg.resourceFilter) rule.resourceFilter = arg.resourceFilter;
    if (arg.comment) rule.comment = arg.comment;
    if (arg.disabled) rule.disabled = arg.disabled;
    if (arg.category) rule.category = arg.category;
    if (arg.actions) rule.actions = calculateActions(arg.actions);
    if (arg.context) rule.ruleContext = getRuleContext(arg.context);
    if (arg.modifiedByUserName)
      rule.modifiedByUserName = arg.modifiedByUserName;

    let updateCommon = new UpdateCommonProperties(this, rule, arg);
    rule = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`systemrule/${arg.id}`, { ...rule })
      .then((res) => res.data as ISystemRule);
  }
}

function calculateActions(actions): number {
  const actionsMeta = {
    None: 0,
    Create: 1,
    "Allow access": 1,
    Read: 2,
    Update: 4,
    Delete: 8,
    Export: 16,
    Publish: 32,
    "Change owner": 64,
    "Change role": 128,
    "Export data": 256,
    "Offline access": 512,
    Distribute: 1024,
    Duplicate: 2048,
    Approve: 4096,
  };

  const reducer = (accumulator: number, currentValue: number) =>
    accumulator + currentValue;

  return actions
    .map((t) => {
      return actionsMeta[t];
    })
    .reduce(reducer);
}

function getRuleContext(context) {
  if (context == "both") return 0;
  if (context == "BothQlikSenseAndQMC") return 0;
  if (context == "hub") return 1;
  if (context == "qmc") return 2;
}
