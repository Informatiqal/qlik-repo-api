import { QlikRepositoryClient } from "./main";
import { URLBuild } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { GetCommonProperties } from "./util/GetCommonProps";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { IAudit } from "./License.interface";

import {
  ISystemRule,
  ISystemRuleCondensed,
  ISystemRuleCreate,
  ISystemRuleUpdate,
  ISystemRuleLicenseCreate,
  ISystemRuleAuditGet,
  TSystemRuleActions,
  TSystemRuleContext,
} from "./SystemRule.interface";
export interface IClassSystemRule {
  get(id: string): Promise<ISystemRule>;
  getAll(): Promise<ISystemRuleCondensed[]>;
  getAudit(arg: ISystemRuleAuditGet): Promise<IAudit>;
  getFilter(filter: string): Promise<ISystemRule[]>;
  create(arg: ISystemRuleCreate): Promise<ISystemRule>;
  licenseCreate(arg: ISystemRuleLicenseCreate): Promise<any>;
  remove(id: string): Promise<IEntityRemove>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
  update(arg: ISystemRuleUpdate): Promise<ISystemRule>;
}

export class SystemRule implements IClassSystemRule {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string): Promise<ISystemRule> {
    if (!id) throw new Error(`systemRule.get: "id" parameter is required`);
    return await this.repoClient
      .Get(`systemrule/${id}`)
      .then((res) => res.data as ISystemRule);
  }

  public async getAll() {
    return await this.repoClient
      .Get(`systemrule`)
      .then((res) => res.data as ISystemRuleCondensed[]);
  }

  public async getAudit(arg: ISystemRuleAuditGet): Promise<IAudit> {
    return await this.repoClient
      .Post(`systemrule/security/audit`, { ...arg })
      .then((res) => res.data as IAudit);
  }

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`systemRule.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`systemrule?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ISystemRule[]);
  }

  public async create(arg: ISystemRuleCreate) {
    if (!arg.actions)
      throw new Error(`systemRule.create: "actions" parameter is required`);
    if (!arg.category)
      throw new Error(`systemRule.create: "category" parameter is required`);
    if (!arg.name)
      throw new Error(`systemRule.create: "name" parameter is required`);
    if (!arg.resourceFilter)
      throw new Error(
        `systemRule.create: "resourceFilter" parameter is required`
      );
    if (!arg.rule)
      throw new Error(`systemRule.create: "rule" parameter is required`);

    let rule: ISystemRule = {
      name: arg.name,
      disabled: arg.disabled || false,
      actions: this.calculateActions(arg.actions),
      ruleContext: arg.context ? this.getRuleContext(arg.context) : 0,
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

  //TODO: whats the return type here?
  public async licenseCreate(arg: ISystemRuleLicenseCreate) {
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

  public async remove(id: string): Promise<IEntityRemove> {
    if (!id) throw new Error(`systemRule.remove: "id" parameter is required`);

    return await this.repoClient.Delete(`systemrule/${id}`).then((res) => {
      return { id, status: res.status } as IEntityRemove;
    });
  }

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `systemRule.removeFilter: "filter" parameter is required`
      );

    const tags = await this.getFilter(filter).then((t: ISystemRule[]) => {
      if (t.length == 0)
        throw new Error(`systemRule.removeFilter: filter query return 0 items`);

      return t;
    });
    return await Promise.all<IEntityRemove>(
      tags.map((tag: ISystemRule) => {
        return this.remove(tag.id);
      })
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/systemrule`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }

  public async update(arg: ISystemRuleUpdate): Promise<ISystemRule> {
    if (!arg.id)
      throw new Error(`systemRule.update: "id" parameter is required`);

    let rule = await this.get(arg.id);

    if (arg.name) rule.name = arg.name;
    if (arg.rule) rule.rule = arg.rule;
    if (arg.resourceFilter) rule.resourceFilter = arg.resourceFilter;
    if (arg.comment) rule.comment = arg.comment;
    if (arg.disabled) rule.disabled = arg.disabled;
    if (arg.category) rule.category = arg.category;
    if (arg.actions) rule.actions = this.calculateActions(arg.actions);
    if (arg.context) rule.ruleContext = this.getRuleContext(arg.context);

    let updateCommon = new UpdateCommonProperties(this, rule, arg);
    rule = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`systemrule/${arg.id}`, { ...rule })
      .then((res) => res.data as ISystemRule);
  }

  private calculateActions(actions: TSystemRuleActions[]): number {
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

  private getRuleContext(context: TSystemRuleContext) {
    if (context == "both") return 0;
    if (context == "BothQlikSenseAndQMC") return 0;
    if (context == "hub") return 1;
    if (context == "qmc") return 2;

    throw new Error(
      `systemRule.update: "${context}" is not a valid context. Valid context values are "both", "BothQlikSenseAndQMC", "hub" and "qmc"`
    );
  }
}
