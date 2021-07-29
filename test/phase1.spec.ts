import fs from "fs";
import chai from "chai";
import { Config, Helpers } from "./Config";

const expect = chai.expect;
const config = new Config();
const repoApi = config.repoApi;

const helpers = new Helpers();
/**
 * Phase1 tests:
 * About, App, Content library, Custom property, Engine,
 * Extension, Stream, System rule, Table, Tag, Task, User
 */
describe("App operations", function () {
  this.timeout(30000);

  /**
   * Test apps list methods
   * Used methods: app.get, app.getFilter, app.select
   */
  it("List apps", async function () {
    let allApps = await repoApi.app.getAll();
    let singleApp = await repoApi.app.get(allApps[0].id);
    let filterApp = await repoApi.app.getFilter(
      `name eq '${singleApp[0].name}'`
    );
    let selectApp = await repoApi.app.select(`name eq '${singleApp[0].name}'`);

    expect(allApps.length).to.be.greaterThan(0) &&
      expect(singleApp.id).to.be.equal(allApps[0].id) &&
      expect(filterApp[0].id).to.be.equal(singleApp.id) &&
      expect(selectApp.items.length).to.be.equal(1);
  });

  /**
   * Complex workflow
   * import qvf, create stream, custom property and tags
   * update the imported app - set the custom prop and tags, update the name
   * update the created stream - set the custom prop and tags
   * publish the imported app to the new stream
   * delete - imported app, created stream, created custom property and tags
   * Used methods: app.upload, app.update, app.publish, app.remove
   *               tag.create, tag.removeFilter
   *               stream.create, stream.update, stream.remove
   *               customProperty.create, customProperty.remove
   */
  it("Complex App workflow", async function () {
    let appName = helpers.uuid();
    let appNewName = helpers.uuid();
    let cpName = helpers.uuidString();
    let cpValues = [helpers.uuid(), helpers.uuid()];
    let tagNames = [helpers.uuid(), helpers.uuid()];
    let streamName = helpers.uuid();
    let qvf = fs.readFileSync(process.env.IMPORT_APP_FILE);

    let uploadedApp = await repoApi.app.upload(appName, qvf);

    let customProperty = await repoApi.customProperty.create({
      name: cpName,
      choiceValues: [helpers.uuid(), helpers.uuid()],
      objectTypes: ["App", "Stream"],
    });

    let tags = await Promise.all(
      tagNames.map(async (t) => {
        return await repoApi.tag.create(t);
      })
    );

    let updatedApp = await repoApi.app.update({
      id: uploadedApp.id,
      name: appNewName,
      customProperties: [
        `${cpName}=${cpValues[0]}`,
        `${cpName}=${cpValues[1]}`,
      ],
      tags: [tags[0].name, tags[1].name],
    });

    let newStream = await repoApi.stream.create({
      name: streamName,
      tags: [tags[1].name],
    });

    let updateStream = await repoApi.stream.update({
      id: newStream.id,
      customProperties: [`${cpName}=${cpValues[1]}`],
    });

    let publishApp = await repoApi.app.publish(uploadedApp.id, streamName);

    let deleteApp = await repoApi.app.remove(uploadedApp.id);
    let deleteCP = await repoApi.customProperty.remove(customProperty.id);
    let deleteTags = await Promise.all(
      tags.map(async (t) => {
        return await repoApi.tag
          .removeFilter(`name eq '${t.name}'`)
          .then((t) => t[0]);
      })
    );
    let deleteStream = await repoApi.stream.remove(newStream.id);

    expect(uploadedApp.name).to.be.equal(appName) &&
      expect(updatedApp.name).to.be.equal(appNewName) &&
      expect(deleteApp.status).to.be.equal(204) &&
      expect(deleteCP.id).to.be.equal(customProperty.id) &&
      expect(deleteTags.length).to.be.equal(2) &&
      expect(publishApp.stream.name).to.be.equal(streamName) &&
      expect(updateStream.customProperties.length).to.be.equal(1) &&
      expect(deleteStream.status).to.be.equal(204);
  });
});
