export interface IAccessTypesInfoAccessTypeCondensed {
  schemaPath?: string;
  tokenCost?: number;
  allocatedTokens?: number;
  usedTokens?: number;
  quarantinedTokens?: number;
}

export interface IAccessTypeInfo {
  schemaPath?: string;
  totalTokens?: number;
  availableTokens?: number;
  professionalAccessType?: IAccessTypesInfoAccessTypeCondensed;
  userAccessType?: IAccessTypesInfoAccessTypeCondensed;
  loginAccessType?: IAccessTypesInfoAccessTypeCondensed;
  analyzerAccessType?: IAccessTypesInfoAccessTypeCondensed;
}

export interface ILicense {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  lef?: string;
  serial?: string;
  check?: string;
  key?: string;
  name?: string;
  organization?: string;
  product?: number;
  numberOfCores?: number;
  isExpired?: boolean;
  expiredReason?: string;
  isBlacklisted?: boolean;
  isInvalid?: boolean;
  isSubscription?: boolean;
  isCloudServices?: boolean;
  isElastic?: boolean;
}

export interface ILicenseAccessTypeCondensed {
  id?: string;
  privileges?: string[];
}

export interface IAuditUserCondensed {
  schemaPath?: string;
  userId?: string;
  userDirectory?: string;
  name?: string;
}
export interface IAuditResourceCondensed {
  schemaPath?: string;
  id?: string;
  name?: string;
}

export interface IAuditRuleCondensed {
  schemaPath?: string;
  id?: string;
  name?: string;
  actions?: number;
  disabled?: boolean;
}

export interface ISystemRuleApplicationItemCondensed {
  schemaPath?: string;
  userID?: string;
  resourceID?: string;
  ruleID?: string;
  allowed?: boolean;
  errorAt?: number;
  errorMessage?: string;
  evaluationState?: number;
}

export interface IAudit {
  schemaPath?: string;
  users?: IAuditUserCondensed[];
  resources?: IAuditResourceCondensed[];
  rules?: IAuditRuleCondensed[];
  ruleApplication?: ISystemRuleApplicationItemCondensed[];
}

export interface ILicenseAccessGroup {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  privileges?: string[];
  name?: string;
}

export interface IAuditParameters {
  resourceId?: string;
  resourceType?: string;
  resourceFilter?: string;
  userFilter?: string;
  environmentAttributes?: string;
  userSkip?: number;
  userTake?: number;
  resourceSkip?: number;
  resourceTake?: number;
  includeNonGrantingRules?: boolean;
}

interface ILicenseBase {
  name: string;
  organization?: string;
}

export interface ILicenseSetSerial extends ILicenseBase {
  serial: string;
  control: string;
  lef: string;
}

export interface ILicenseSetKey extends ILicenseBase {
  key: string;
}
