import chai from "chai";
import { Config } from "./Config";

const expect = chai.expect;
const config = new Config();
const repoApi = config.repoApi;

describe("Tag operations", function () {
  this.timeout(30000);

  it("Create, Update, Delete", async function () {
    let newTagName = "Rest API Test";
    let newName = "New name";

    let newTag = await repoApi.tagCreate(newTagName);
    let updateTag = await repoApi.tagUpdate(newTag.id, newName);
    let deleteTag = await repoApi.tagRemove(newTag.id);

    expect(newTag.name).to.equal(newTagName) &&
      expect(updateTag.name).to.equal(newName) &&
      expect(deleteTag.status).to.equal(204) &&
      expect(deleteTag.id).to.equal(newTag.id);
  });

  it("Get all tags", async function () {
    let allTags = await repoApi.tagGetAll();

    expect(allTags.length).to.be.greaterThan(0);
  });

  it("Get tags filter", async function () {
    let newTag = await repoApi.tagCreate("Rest API test");
    let filterResults = await repoApi.tagGetFilter(`name eq '${newTag.name}'`);
    let deleteTag = await repoApi.tagRemove(newTag.id);

    expect(filterResults.length).to.be.equal(1) &&
      expect(deleteTag.status).to.be.equal(204);
  });
});
