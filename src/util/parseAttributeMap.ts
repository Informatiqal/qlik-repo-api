import {
  IVirtualProxyConfigJwtAttributeMapItem,
  IVirtualProxyConfigOidcAttributeMapItem,
  IVirtualProxyConfigSamlAttributeMapItem,
} from "../types/interfaces";

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
  switch (authenticationMethod.toLocaleLowerCase()) {
    case "ticket":
      return 0;
    case "static":
      return 1;
    case "headerstaticuserdirectory":
      return 1;
    case "dynamic":
      return 2;
    case "headerdynamicuserdirectory":
      return 2;
    case "saml":
      return 3;
    case "jwt":
      return 4;
    default:
      throw new Error(
        `virtualProxy.create: "authenticationMethod" not found "${authenticationMethod}"`
      );
  }
}

export function parseSameSiteAttribute(sameSiteAttribute: string): number {
  switch (sameSiteAttribute.toLowerCase()) {
    case "no attribute":
      return 0;
    case "none":
      return 1;
    case "lax":
      return 2;
    case "strict":
      return 3;
    default:
      return 0;
  }
}

export function parseAnonymousAccessMode(anonymousAccessMode: string): number {
  if (anonymousAccessMode.toLowerCase() == "no anonymous") return 0;
  if (anonymousAccessMode.toLowerCase() == "allow anonymous") return 1;
  if (anonymousAccessMode.toLowerCase() == "always anonymous") return 2;

  throw new Error(
    `virtualProxy.create: "anonymousAccessMode" not found "${anonymousAccessMode}"`
  );
}
