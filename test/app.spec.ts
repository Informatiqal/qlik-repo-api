import fs from "fs";
import chai from "chai";
import { Config } from "./Config";

const expect = chai.expect;
const config = new Config();
const repoApi = config.repoApi;

describe("App operations", function () {
  this.timeout(30000);

  // Used methods: appGet, appGetFilter, appSelect
  it("List apps", async function () {
    let allApps = await repoApi.appGet();
    let singleApp = await repoApi.appGet(allApps[0].id);
    let filterApp = await repoApi.appGetFilter(
      `name eq '${singleApp[0].name}'`
    );
    let selectApp = await repoApi.appSelect(`name eq '${singleApp[0].name}'`);

    expect(allApps.length).to.be.greaterThan(0) &&
      expect(singleApp.length).to.be.equal(1) &&
      expect(filterApp[0].id).to.be.equal(singleApp[0].id) &&
      expect(selectApp.items.length).to.be.equal(1);
  });

  // Used methods: appUpload, appUpdate, appPublish, appRemove
  //               tagCreate, tagRemoveFilter
  //               streamCreate, streamUpdate, streamRemove
  //               customPropertyCreate, customPropertyRemove
  it("Upload, Update and Delete app", async function () {
    let appName = "my-imported-app";
    let appNewName = "my-imported-app-updated";
    let cpName = "testCP";
    let streamName = "testing stream";
    let qvf = fs.readFileSync(process.env.IMPORT_APP_FILE);
    let uploadedApp = await repoApi.appUpload(appName, qvf);

    let customProperty = await repoApi.customPropertyCreate({
      name: cpName,
      choiceValues: ["test-value-1", "test-value-2"],
      objectTypes: ["App", "Stream"],
    });

    let tags = ["test tag1", "test tag2"];
    await Promise.all(
      tags.map(async (t) => {
        await repoApi.tagCreate(t);
      })
    );

    let updatedApp = await repoApi.appUpdate({
      id: uploadedApp.id,
      name: appNewName,
      customProperties: [`${cpName}=test value1`, `${cpName}=test value 2`],
      tags: [...tags],
    });

    let newStream = await repoApi.streamCreate({
      name: streamName,
      tags: ["test tag2"],
    });

    let updateStream = await repoApi.streamUpdate({
      id: newStream.id,
      customProperties: [`${cpName}=test value 2`],
    });

    let publishApp = await repoApi.appPublish(uploadedApp.id, streamName);

    let deleteApp = await repoApi.appRemove(uploadedApp.id);
    let deleteCP = await repoApi.customPropertyRemove(customProperty.id);
    let deleteTags = await Promise.all(
      tags.map(async (t) => {
        return await repoApi
          .tagRemoveFilter(`name eq '${t}'`)
          .then((t) => t[0]);
      })
    );
    let deleteStream = await repoApi.streamRemove(newStream.id);

    expect(uploadedApp.name).to.be.equal(appName) &&
      expect(updatedApp.name).to.be.equal(appNewName) &&
      expect(deleteApp.status).to.be.equal(204) &&
      expect(deleteCP.id).to.be.equal(customProperty.id) &&
      expect(deleteTags.length).to.be.equal(2) &&
      expect(publishApp.stream.name).to.be.equal(streamName) &&
      expect(updateStream.customProperties.length).to.be.equal(2) &&
      expect(deleteStream.status).to.be.equal(204);
  });
});
