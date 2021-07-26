import { QlikRepoApi } from "./main";
import { modifiedDateTime } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { GetCommonProperties } from "./util/GetCommonProps";

import {
  IHttpStatus,
  IHttpReturnRemove,
  ISystemRule,
  IAudit,
  TSystemRuleActions,
  TSystemRuleContext,
  ISystemRuleCondensed,
  IStreamCondensed,
} from "./interfaces";
import {
  ISystemRuleCreate,
  ISystemRuleUpdate,
  ISystemRuleAuditGet,
  ISystemRuleLicenseCreate,
} from "./interfaces/argument.interface";

export class SystemRule {
  constructor() {}

  public async ruleGet(this: QlikRepoApi, id: string): Promise<ISystemRule> {
    if (!id) throw new Error(`ruleGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`systemrule/${id}`)
      .then((res) => res.data as ISystemRule);
  }

  public async ruleGetAll(this: QlikRepoApi): Promise<ISystemRuleCondensed[]> {
    return await this.repoClient
      .Get(`systemrule`)
      .then((res) => res.data as ISystemRuleCondensed[]);
  }

  public async ruleGetAudit(
    this: QlikRepoApi,
    arg: ISystemRuleAuditGet
  ): Promise<IAudit> {
    return await this.repoClient
      .Post(`systemrule/security/audit`, { ...arg })
      .then((res) => res.data as IAudit);
  }

  public async ruleGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<ISystemRule[]> {
    if (!filter)
      throw new Error(`ruleGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`systemrule?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ISystemRule[]);
  }

  public async ruleCreate(
    this: QlikRepoApi,
    arg: ISystemRuleCreate
  ): Promise<ISystemRule> {
    if (!arg.actions)
      throw new Error(`ruleCreate: "actions" parameter is required`);
    if (!arg.category)
      throw new Error(`ruleCreate: "category" parameter is required`);
    if (!arg.name) throw new Error(`ruleCreate: "name" parameter is required`);
    if (!arg.resourceFilter)
      throw new Error(`ruleCreate: "resourceFilter" parameter is required`);
    if (!arg.rule) throw new Error(`ruleCreate: "rule" parameter is required`);

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

  public async ruleLicenseCreate(
    this: QlikRepoApi,
    arg: ISystemRuleLicenseCreate
  ) {
    let rule = {
      name: arg.name,
      type: "Custom",
      rule: arg.rule || "",
      disabled: arg.disabled || false,
      comment: arg.comment || "",
      resourceFilter: "",
      actions: 1,
      ruleContext: 1,
      schemaPath: "SystemRule",
      category: "License",
      customProperties: [],
      tags: [],
    };

    let commonProps = new GetCommonProperties(
      this,
      arg.customProperties || [],
      arg.tags || [],
      ""
    );

    let props = await commonProps.getAll();
    rule.customProperties = props.customProperties;
    rule.tags = props.tags;

    let accessGroup = await this.repoClient.Post(
      `license/${arg.type}accessgroup`,
      { name: arg.name }
    );

    rule.resourceFilter = `License.${arg.type}AccessGroup_${accessGroup.data.id}`;

    return await this.repoClient.Post(`systemrule`, rule);
  }

  public async ruleRemove(
    this: QlikRepoApi,
    id: string
  ): Promise<IHttpReturnRemove> {
    if (!id) throw new Error(`ruleRemove: "id" parameter is required`);

    return await this.repoClient.Delete(`systemrule/${id}`).then((res) => {
      return { id, status: res.status as IHttpStatus };
    });
  }

  public async ruleUpdate(
    this: QlikRepoApi,
    arg: ISystemRuleUpdate
  ): Promise<ISystemRule> {
    if (!arg.id) throw new Error(`ruleUpdate: "id" parameter is required`);

    let rule = await this.ruleGet(arg.id);

    if (arg.name) rule.name = arg.name;
    if (arg.rule) rule.rule = arg.rule;
    if (arg.resourceFilter) rule.resourceFilter = arg.resourceFilter;
    if (arg.comment) rule.comment = arg.comment;
    if (arg.disabled) rule.disabled = arg.disabled;
    if (arg.category) rule.category = arg.category;
    if (arg.actions) rule.actions = calculateActions(arg.actions);
    if (arg.context) rule.ruleContext = getRuleContext(arg.context);

    let updateCommon = new UpdateCommonProperties(this, rule, arg);
    rule = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`systemrule/${arg.id}`, { ...rule })
      .then((res) => res.data as ISystemRule);
  }
}

function calculateActions(actions: TSystemRuleActions[]): number {
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

function getRuleContext(context: TSystemRuleContext) {
  if (context == "both") return 0;
  if (context == "BothQlikSenseAndQMC") return 0;
  if (context == "hub") return 1;
  if (context == "qmc") return 2;

  throw new Error(
    `"${context}" is not a valid context. Valid context values are "both", "BothQlikSenseAndQMC", "hub" and "qmc"`
  );
}
