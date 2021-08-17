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
  if (authenticationMethod == "Ticket") return 0;
  if (authenticationMethod == "static") return 1;
  if (authenticationMethod == "dynamic") return 2;
  if (authenticationMethod == "SAML") return 3;
  if (authenticationMethod == "JWT") return 4;

  return 0;
}
