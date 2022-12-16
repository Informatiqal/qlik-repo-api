import { TSystemRuleActions, TSystemRuleContext } from "../types/ranges";

export class URLBuild {
  private url: string;
  private params = [] as any;
  constructor(url: string) {
    this.url = url;
  }

  addParam(name: string, value: any) {
    if (value) this.params.push(`${name}=${encodeURIComponent(value)}`);
  }

  private getParams() {
    return this.params.join("&");
  }

  getUrl() {
    if (this.params.length == 0) return this.url;

    this.url += `?${this.getParams()}`;
    return this.url;
  }
}

export function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function modifiedDateTime(): string {
  return new Date().toISOString();
}

export function calculateActions(actions: TSystemRuleActions[]): number {
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

export function getRuleContext(context: TSystemRuleContext) {
  if (context == "both") return 0;
  if (context == "BothQlikSenseAndQMC") return 0;
  if (context == "hub") return 1;
  if (context == "qmc") return 2;

  throw new Error(
    `systemRule.update: "${context}" is not a valid context. Valid context values are "both", "BothQlikSenseAndQMC", "hub" and "qmc"`
  );
}

export function AddRemoveSet(
  optionsOperation: "set" | "add" | "remove",
  detailsValues: any,
  arg: any
) {
  if (arg && !optionsOperation) return arg;

  if (optionsOperation == "set") return arg;

  if (optionsOperation == "add")
    return Array.from(new Set([...detailsValues, ...arg]));

  if (optionsOperation == "remove")
    return detailsValues.filter((l) => !arg.includes(l));
}
