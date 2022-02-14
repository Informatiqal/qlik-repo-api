import fs from "fs";
import path from "path";
import https from "https";

const dotEnvPath = path.resolve(".env");
require("dotenv").config({ path: dotEnvPath });

import { QlikRepoApi } from "../src";

export class Config {
  public repoApi: QlikRepoApi.client;
  public repoApiJWT: QlikRepoApi.client;
  constructor() {
    const cert = fs.readFileSync(`${process.env.TEST_CERT}/client.pem`);
    const key = fs.readFileSync(`${process.env.TEST_CERT}/client_key.pem`);

    const httpsAgentCert = new https.Agent({
      rejectUnauthorized: false,
      cert: cert,
      key: key,
    });

    const repoApi = new QlikRepoApi.client({
      host: process.env.TEST_HOST,
      port: 4242,
      httpsAgent: httpsAgentCert,
      authentication: {
        user_dir: process.env.TEST_USER_DIR,
        user_name: process.env.TEST_USER_ID,
      },
    });

    const repoApiJWT = new QlikRepoApi.client({
      host: process.env.TEST_HOST,
      port: 443,
      proxy: "jwt",
      httpsAgent: httpsAgentCert,
      authentication: {
        token: `${process.env.AUTH_JWT_TOKEN}`,
      },
    });

    this.repoApi = repoApi;
    this.repoApiJWT = repoApiJWT;
  }
}

export class Helpers {
  constructor() {}

  uuidString(): string {
    let guid = this.uuid();
    return guid.replace(/-/g, "");
  }

  uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
