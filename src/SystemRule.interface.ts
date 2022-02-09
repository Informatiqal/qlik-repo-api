import { ITagCondensed } from "./Tags";

export type TSystemRuleCategory = "License" | "Security" | "Sync";
export type TSystemRuleActions =
  | "None"
  | "Create"
  | "Read"
  | "Update"
  | "Delete"
  | "Export"
  | "Publish"
  | "Change owner"
  | "Change role"
  | "Export data"
  | "Offline access"
  | "Distribute"
  | "Duplicate"
  | "Approve"
  | "Allow access";
export type TSystemRuleContext = "hub" | "qmc" | "both" | "BothQlikSenseAndQMC";
export interface ISystemRuleCondensed {
  id?: string;
  privileges?: string[];
  category: TSystemRuleCategory;
  subcategory?: string;
  type: "Custom";
  name: string;
  rule: string;
  resourceFilter: string;
  actions: number;
  comment?: string;
  disabled?: boolean;
}

export interface ISystemRule extends ISystemRuleCondensed {
  createdDate?: string;
  modifiedDate?: string;
  schemaPath?: string;
  ruleContext: number;
  seedId?: string;
  version?: number;
  tags?: ITagCondensed[];
}

export interface ISystemRuleCreate {
  name: string;
  category: TSystemRuleCategory;
  rule: string;
  resourceFilter: string;
  context?: TSystemRuleContext;
  actions: TSystemRuleActions[];
  comment?: string;
  disabled?: boolean;
  tags?: string[];
  customProperties?: string[];
}

export type TSystemRuleType = "Analyzer" | "Professional";
export interface ISystemRuleLicenseCreate {
  name: string;
  type: TSystemRuleType;
  rule: string;
  comment?: string;
  disabled?: boolean;
  tags?: string[];
  customProperties?: string[];
}

export interface ISystemRuleUpdate {
  // id: string;
  name?: string;
  category?: TSystemRuleCategory;
  rule?: string;
  resourceFilter?: string;
  context?: TSystemRuleContext;
  actions?: TSystemRuleActions[];
  comment?: string;
  disabled?: boolean;
  tags?: string[];
  customProperties?: string[];
}

export interface ISystemRuleAuditGet {
  schemaPath?: string;
  resourceType?: string;
  resourceFilter?: string;
  userFilter?: string;
  environmentAttribute?: string;
  userSkip?: number;
  userTake?: number;
  resourceSkip?: number;
  resourceTake?: number;
  includeNonGrantingRules?: boolean;
}
