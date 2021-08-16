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
  get(id: string): Promise<IClassSystemRule>;
  getAll(): Promise<IClassSystemRule[]>;
  getAudit(arg: ISystemRuleAuditGet): Promise<IAudit>;
  getFilter(filter: string): Promise<IClassSystemRule[]>;
  create(arg: ISystemRuleCreate): Promise<IClassSystemRule>;
  licenseCreate(arg: ISystemRuleLicenseCreate): Promise<IClassSystemRule>;
  removeFilter(filter: string): Promise<IEntityRemove[]>;
  select(filter?: string): Promise<ISelection>;
}

export class SystemRules implements IClassSystemRules {
  private repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.repoClient = mainRepoClient;
  }

  public async get(id: string) {
    if (!id) throw new Error(`systemRules.get: "id" parameter is required`);
    const sr: SystemRule = new SystemRule(this.repoClient, id);
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

  public async getFilter(filter: string) {
    if (!filter)
      throw new Error(`systemRule.getFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`systemrule?filter=(${encodeURIComponent(filter)})`)
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

  public async removeFilter(filter: string) {
    if (!filter)
      throw new Error(
        `systemRule.removeFilter: "filter" parameter is required`
      );

    const srs = await this.getFilter(filter);
    return Promise.all<IEntityRemove>(
      srs.map((sr: IClassSystemRule) =>
        sr.remove().then((s) => ({ id: sr.details.id, status: s }))
      )
    );
  }

  public async select(filter?: string) {
    const urlBuild = new URLBuild(`selection/systemrule`);
    urlBuild.addParam("filter", filter);

    return await this.repoClient
      .Post(urlBuild.getUrl(), {})
      .then((res) => res.data as ISelection);
  }
}
