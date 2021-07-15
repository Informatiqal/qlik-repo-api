import chai from "chai";
import { Config } from "./Config";

const expect = chai.expect;
const config = new Config();
const repoApi = config.repoApi;

describe("Engine operations", function () {
  this.timeout(30000);

  it("Get all engines and single engine", async function () {
    const allEngines = await repoApi.engineGetAll();
    let engine = await repoApi.engineGet(allEngines[0].id);

    expect(allEngines.length).to.be.greaterThan(0) &&
      expect(engine.serverNodeConfiguration.hostName).to.be(
        `${process.env.TEST_HOST}`
      );
  });

  it("Get engine filter", async function () {
    let filterResults = await repoApi.engineGetFilter(
      `serverNodeConfiguration.name eq 'Central'`
    );

    expect(filterResults.length).to.be.greaterThan(0);
  });
});
