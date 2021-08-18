import fs from "fs";
import path from "path";
import https from "https";
import { v4 as uuidv4 } from "uuid";

const dotEnvPath = path.resolve(".env");
require("dotenv").config({ path: dotEnvPath });

import { QlikRepoApi } from "../src";

export class Config {
  public repoApi: QlikRepoApi.client;
  constructor() {
    const cert = fs.readFileSync(`${process.env.TEST_CERT}/client.pem`);
    const key = fs.readFileSync(`${process.env.TEST_CERT}/client_key.pem`);

    const httpsAgentCert = new https.Agent({
      rejectUnauthorized: false,
      cert: cert,
      key: key,
    });

    let repoApi = new QlikRepoApi.client({
      host: process.env.TEST_HOST,
      port: 4242,
      httpsAgent: httpsAgentCert,
      authentication: {
        user_dir: process.env.TEST_USER_DIR,
        user_name: process.env.TEST_USER_ID,
      },
    });

    this.repoApi = repoApi;
  }
}

export class Helpers {
  constructor() {}

  uuidString(): string {
    let guid = uuidv4();
    return guid.replace(/-/g, "");
  }

  uuid(): string {
    return uuidv4();
  }
}
