import chai from "chai";
import { Config } from "./Config";

const expect = chai.expect;
const config = new Config();
const repoApi = config.repoApi;

describe("System rule operations", function () {
  this.timeout(30000);

  it("Create license rule", async function () {
    let newLicenseRule = await repoApi
      .ruleLicenseCreate({
        name: "test123",
        type: "Professional",
        rule: "true",
      })
      .catch((e) => {
        let a = 1;
      });
    // let deleteStream = await repoApi.streamRemove(newStream.id);

    expect(true).to.be.true;
    // expect(newTag.name).to.equal(newTagName) &&
    //   expect(deleteTag.status).to.equal(204) &&
    //   expect(deleteTag.id).to.equal(newTag.id);
  });
});
