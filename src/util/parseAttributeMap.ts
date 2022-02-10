import {
  IVirtualProxyConfigJwtAttributeMapItem,
  IVirtualProxyConfigOidcAttributeMapItem,
  IVirtualProxyConfigSamlAttributeMapItem,
} from "../Proxy.interface";

export function parseOidcAttributeMap(
  mappings: string[]
): IVirtualProxyConfigOidcAttributeMapItem[] {
  return mappings.map((mapping) => {
    const [senseAttribute, oidcAttribute] = mapping.split("=");
    return {
      senseAttribute: senseAttribute,
      oidcAttribute: oidcAttribute,
      isMandatory: true,
    } as IVirtualProxyConfigOidcAttributeMapItem;
  });
}

export function parseJwtAttributeMap(
  mappings: string[]
): IVirtualProxyConfigJwtAttributeMapItem[] {
  return mappings.map((mapping) => {
    let [senseAttribute, jwtAttribute] = mapping.split("=");
    return {
      senseAttribute: senseAttribute,
      jwtAttribute: jwtAttribute,
      isMandatory: true,
    } as IVirtualProxyConfigJwtAttributeMapItem;
  });
}

export function parseSamlAttributeMap(
  mappings: string[]
): IVirtualProxyConfigSamlAttributeMapItem[] {
  return mappings.map((mapping) => {
    let [senseAttribute, samlAttribute] = mapping.split("=");
    return {
      senseAttribute: senseAttribute,
      samlAttribute: samlAttribute,
      isMandatory: true,
    } as IVirtualProxyConfigSamlAttributeMapItem;
  });
}

export function parseAuthenticationMethod(
  authenticationMethod: string
): number {
  if (authenticationMethod.toLowerCase() == "ticket") return 0;
  if (authenticationMethod.toLowerCase() == "static") return 1;
  if (authenticationMethod.toLowerCase() == "headerstaticuserdirectory")
    return 1;
  if (authenticationMethod.toLowerCase() == "dynamic") return 2;
  if (authenticationMethod.toLowerCase() == "headerdynamicuserdirectory")
    return 2;
  if (authenticationMethod.toLowerCase() == "saml") return 3;
  if (authenticationMethod.toLowerCase() == "jwt") return 4;

  throw new Error(
    `virtualProxy.create: "authenticationMethod" not found "${authenticationMethod}"`
  );
}

export function parseSameSiteAttribute(sameSiteAttribute: string): number {
  if (sameSiteAttribute.toLowerCase() == "no attribute") return 0;
  if (sameSiteAttribute.toLowerCase() == "none") return 1;
  if (sameSiteAttribute.toLowerCase() == "lax") return 2;
  if (sameSiteAttribute.toLowerCase() == "strict") return 3;

  return 0;
}

export function parseAnonymousAccessMode(anonymousAccessMode: string): number {
  if (anonymousAccessMode.toLowerCase() == "no anonymous") return 0;
  if (anonymousAccessMode.toLowerCase() == "allow anonymous") return 1;
  if (anonymousAccessMode.toLowerCase() == "always anonymous") return 2;

  throw new Error(
    `virtualProxy.create: "anonymousAccessMode" not found "${anonymousAccessMode}"`
  );
}
