import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild, calculateActions, getRuleContext } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { GetCommonProperties } from "./util/GetCommonProps";

import { IEntityRemove, ISelection } from "./types/interfaces";
import { IAudit } from "./License.interface";

import {
  ISystemRule,
  ISystemRuleCreate,
  ISystemRuleLicenseCreate,
  ISystemRuleAuditGet,
} from "./SystemRule.interface";
import { IClassSystemRule, SystemRule } from "./SystemRule";
export interface IClassSystemRules {
  get(arg: { id: string }): Promise<IClassSystemRule>;
  getAll(): Promise<IClassSystemRule[]>;
  getAudit(arg: ISystemRuleAuditGet): Promise<IAudit>;
  getFilter(arg: { filter: string }): Promise<IClassSystemRule[]>;
  create(arg: ISystemRuleCreate): Promise<IClassSystemRule>;
  licenseCreate(arg: ISystemRuleLicenseCreate): Promise<IClassSystemRule>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class SystemRules implements IClassSystemRules {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`systemRules.get: "id" parameter is required`);
    const sr: SystemRule = new SystemRule(this.repoClient, arg.id);
    await sr.init();

    return sr;
  }

  public async getAll() {
    return await this.repoClient
      .Get(`systemrule/full`)
      .then((res) => res.data as ISystemRule[])
      .then((data) => {
        return data.map((t) => new SystemRule(this.repoClient, t.id, t));
      });
  }

  public async getAudit(arg: ISystemRuleAuditGet): Promise<IAudit> {
    return await this.repoClient
      .Post(`systemrule/security/audit`, { ...arg })
      .then((res) => res.data as IAudit);
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`systemRule.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`systemrule?filter=(${encodeURIComponent(arg.filter)})`)
      .then((res) => res.data as ISystemRule[])
      .then((data) => {
        return data.map((t) => new SystemRule(this.repoClient, t.id, t));
      });
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
      actions: calculateActions(arg.actions),
      ruleContext: arg.context ? getRuleContext(arg.context) : 0,
      category: arg.category || "Security",
      type: "Custom",
      rule: arg.rule || "",
      resourceFilter: arg.resourceFilter || "",
      comment: arg.comment || "",
    };

    if (arg.tags) {
      let updateCommon = new UpdateCommonProperties(this.repoClient, rule, arg);
      rule = await updateCommon.updateAll();
      delete rule.modifiedDate;
    }

    return await this.repoClient
      .Post(`systemrule`, { ...rule })
      .then((res) => res.data as ISystemRule)
      .then((r) => new SystemRule(this.repoClient, r.id, r));
  }

  public async licenseCreate(arg: ISystemRuleLicenseCreate) {
    let rule: { [k: string]: any } = {};

    rule["name"] = arg.name;
    rule["type"] = "Custom";
    rule["rule"] = arg.rule || "";
    rule["disabled"] = arg.disabled || false;
    rule["comment"] = arg.comment || "";
    rule["resourceFilter"] = "";
    rule["actions"] = 1;
    rule["ruleContext"] = 1;
    rule["schemaPath"] = "SystemRule";
    rule["category"] = "License";
    rule["customProperties"] = [];
    rule["tags"] = [];

    let commonProps = new GetCommonProperties(
      this.repoClient,
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

    return await this.repoClient
      .Post(`systemrule`, rule)
      .then((s) => new SystemRule(this.repoClient, s.data.id, s.data));
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `systemRule.removeFilter: "filter" parameter is required`
      );

    const srs = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      srs.map((sr: IClassSystemRule) =>
        sr.remove().then((s) => ({ id: sr.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/systemrule`);
    urlBuild.addParam("filter", arg.filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
