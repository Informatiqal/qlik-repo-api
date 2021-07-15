export class URLBuild {
  private url: string;
  private params = [];
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

export function isGUID(value: string): boolean {
  const match = value.match(
    "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
  );
  if (match === null) {
    return false;
  }
  return true;
}

export function isGUIDError(value: string): boolean {
  let isGuid = isGUID(value);
  if (!isGUID) throw new Error("Expected string in UUID/GUID format");

  return isGuid;
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
