import { QlikRepositoryClient } from "qlik-rest-api";
import { URLBuild, calculateActions, getRuleContext } from "./util/generic";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";
import { GetCommonProperties } from "./util/GetCommonProps";

import {
  IEntityRemove,
  ISelection,
  IAudit,
  ISystemRule,
  ISystemRuleCreate,
  ISystemRuleLicenseCreate,
  ISystemRuleAuditGet,
} from "./types/interfaces";

import { SystemRule } from "./SystemRule";
//TODO: why is no update method here?
export interface IClassSystemRules {
  get(arg: { id: string }): Promise<SystemRule>;
  getAll(): Promise<SystemRule[]>;
  getAudit(arg: ISystemRuleAuditGet): Promise<IAudit>;
  getFilter(arg: { filter: string }): Promise<SystemRule[]>;
  create(arg: ISystemRuleCreate): Promise<SystemRule>;
  licenseCreate(arg: ISystemRuleLicenseCreate): Promise<SystemRule>;
  removeFilter(arg: { filter: string }): Promise<IEntityRemove[]>;
  select(arg?: { filter: string }): Promise<ISelection>;
}

export class SystemRules implements IClassSystemRules {
  #repoClient: QlikRepositoryClient;
  constructor(private mainRepoClient: QlikRepositoryClient) {
    this.#repoClient = mainRepoClient;
  }

  public async get(arg: { id: string }) {
    if (!arg.id) throw new Error(`systemRules.get: "id" parameter is required`);
    const sr: SystemRule = new SystemRule(this.#repoClient, arg.id);
    await sr.init();

    return sr;
  }

  public async getAll() {
    return await this.#repoClient
      .Get<ISystemRule[]>(`systemrule/full`)
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new SystemRule(this.#repoClient, t.id, t));
      });
  }

  public async getAudit(arg: ISystemRuleAuditGet): Promise<IAudit> {
    return await this.#repoClient
      .Post<IAudit>(`systemrule/security/audit`, { ...arg })
      .then((res) => res.data);
  }

  public async getFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(`systemRule.getFilter: "filter" parameter is required`);

    return await this.#repoClient
      .Get<ISystemRule[]>(
        `systemrule?filter=(${encodeURIComponent(arg.filter)})`
      )
      .then((res) => res.data)
      .then((data) => {
        return data.map((t) => new SystemRule(this.#repoClient, t.id, t));
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
      let updateCommon = new UpdateCommonProperties(
        this.#repoClient,
        rule,
        arg
      );
      rule = await updateCommon.updateAll();
      delete rule.modifiedDate;
    }

    return await this.#repoClient
      .Post<ISystemRule>(`systemrule`, { ...rule })
      .then((res) => res.data)
      .then((r) => new SystemRule(this.#repoClient, r.id, r));
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
      this.#repoClient,
      arg.customProperties || [],
      arg.tags || [],
      ""
    );

    let props = await commonProps.getAll();
    rule.customProperties = props.customProperties;
    rule.tags = props.tags;

    const accessGroup = await this.#repoClient.Post<{ id: string }>(
      `license/${arg.type}accessgroup`,
      { name: arg.name }
    );

    rule.resourceFilter = `License.${arg.type}AccessGroup_${accessGroup.data.id}`;

    return await this.#repoClient
      .Post<ISystemRule>(`systemrule`, rule)
      .then((s) => new SystemRule(this.#repoClient, s.data.id, s.data));
  }

  public async removeFilter(arg: { filter: string }) {
    if (!arg.filter)
      throw new Error(
        `systemRule.removeFilter: "filter" parameter is required`
      );

    const srs = await this.getFilter({ filter: arg.filter });
    return Promise.all<IEntityRemove>(
      srs.map((sr) =>
        sr.remove().then((s) => ({ id: sr.details.id, status: s }))
      )
    );
  }

  public async select(arg?: { filter: string }) {
    const urlBuild = new URLBuild(`selection/systemrule`);
    urlBuild.addParam("filter", arg.filter);

    return await this.#repoClient
      .Post<ISelection>(urlBuild.getUrl(), {})
      .then((res) => res.data);
  }
}
