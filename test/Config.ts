import fs from "fs";
import path from "path";
import https from "https";

const dotEnvPath = path.resolve(".env");
require("dotenv").config({ path: dotEnvPath });

import { QlikRepoApi } from "../src/main";

export class Config {
  public repoApi: QlikRepoApi;
  constructor() {
    const cert = fs.readFileSync(`${process.env.TEST_CERT}/client.pem`);
    const key = fs.readFileSync(`${process.env.TEST_CERT}/client_key.pem`);

    const httpsAgentCert = new https.Agent({
      rejectUnauthorized: false,
      cert: cert,
      key: key,
    });

    let repoApi = new QlikRepoApi({
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
