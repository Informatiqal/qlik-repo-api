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
describe("Phase1", function () {
  this.timeout(30000);

  /**
   * Get about
   * Used methods: about.get
   */
  it("About", async function () {
    let about = await repoApi.about.get();

    expect(about).to.have.property("buildVersion");
  });

  /**
   * Test apps list methods
   * Used methods: app.get, app.getFilter, app.select
   */
  it("List apps", async function () {
    let allApps = await repoApi.apps.getAll();
    let singleApp = await repoApi.apps.get(allApps[0].details.id);
    let filterApp = await repoApi.apps.getFilter(
      `name eq '${singleApp.details.name}'`
    );
    let selectApp = await repoApi.apps.select(
      `name eq '${singleApp.details.name}'`
    );

    expect(allApps.length).to.be.greaterThan(0) &&
      expect(singleApp.details.id).to.be.equal(allApps[0].details.id) &&
      expect(filterApp[0].details.id).to.be.equal(singleApp.details.id) &&
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

    let uploadedApp = await repoApi.apps.upload(appName, qvf);

    let customProperty = await repoApi.customProperties.create({
      name: cpName,
      choiceValues: [helpers.uuid(), helpers.uuid()],
      objectTypes: ["App", "Stream"],
    });

    let tags = await Promise.all(
      tagNames.map(async (t) => {
        return await repoApi.tags.create(t);
      })
    );

    let updatedApp = await uploadedApp.update({
      name: appNewName,
      customProperties: [
        `${cpName}=${cpValues[0]}`,
        `${cpName}=${cpValues[1]}`,
      ],
      tags: [tags[0].details.name, tags[1].details.name],
    });

    let newStream = await repoApi.streams.create({
      name: streamName,
      tags: [tags[1].details.name],
    });

    let updateStream = await newStream.update({
      customProperties: [`${cpName}=${cpValues[1]}`],
    });

    let publishApp = await uploadedApp.publish(streamName);

    let deleteApp = await uploadedApp.remove();
    let deleteCP = await customProperty.remove();
    let deleteTags = await Promise.all(
      tags.map(async (t) => {
        return await repoApi.tags
          .removeFilter(`name eq '${t.details.name}'`)
          .then((t) => t[0]);
      })
    );
    let deleteStream = await newStream.remove();

    expect(uploadedApp.details.name).to.be.equal(appNewName) &&
      expect(deleteApp).to.be.equal(204) &&
      expect(deleteCP).to.be.equal(204) &&
      expect(deleteTags.length).to.be.equal(2) &&
      expect(uploadedApp.details.stream.name).to.be.equal(streamName) &&
      expect(newStream.details.customProperties.length).to.be.equal(1) &&
      expect(deleteStream).to.be.equal(204);
  });

  /**
   * Basic audit (QMC -> Audit)
   * User methods: systemRule.getAudit
   */
  it("Security rule - audit apps", async function () {
    const auditResult = await repoApi.systemRules.getAudit({
      resourceType: "App",
    });

    expect(Object.keys(auditResult.resources).length).to.be.greaterThan(0);
  });

  /**
   * Create basic table view to list available appIds
   * User methods: table.create
   */
  it("Create table view", async function () {
    const tableResult = await repoApi.table.create({
      columns: [
        {
          columnType: "Property",
          definition: "id",
          name: "id",
        },
      ],
      type: "App",
    });

    expect(tableResult.status).to.be.equal(201) &&
      expect(tableResult.data.rows.length).to.be.greaterThan(0);
  });

  /**
   * Basic extension operations
   * import extension, list all extensions, create custom property,
   * add the custom property to the extension get the imported extension,
   * delete the extension and the custom property
   * User methods: extension.import, extension.update, extension.remove, extension.get,
   *               extension.getAll, customProperty.create, customProperty.remove
   */
  it("Extensions", async function () {
    const extFile = fs.readFileSync(process.env.IMPORT_EXTENSION_FILE);
    const importExtension = await repoApi.extensions.import({
      file: extFile,
    });
    const allExtensions = await repoApi.extensions.getAll();

    const newCustomProperty = await repoApi.customProperties.create({
      name: helpers.uuidString(),
      choiceValues: [helpers.uuid()],
      objectTypes: ["Extension"],
    });

    const updatedExtension = await importExtension.update({
      customProperties: [
        `${newCustomProperty.details.name}="${newCustomProperty.details.choiceValues[0]}`,
      ],
    });

    const deletedExtension = await importExtension.remove();
    const deleteCustomProperty = await newCustomProperty.remove();

    expect(allExtensions.length).to.be.greaterThan(0) &&
      expect(importExtension.details.customProperties.length).to.be.equal(1) &&
      expect(deletedExtension).to.be.equal(204) &&
      expect(deleteCustomProperty).to.be.equal(204);
  });

  /**
   * Get engines
   * Used methods: engine.getAll
   */
  it("Engine get", async function () {
    let engines = await repoApi.engines.getAll();
    expect(engines.length).to.be.greaterThan(0);
  });

  /**
   * User operations
   * create user, create custom property, update the users with the custom property
   * get users (apply filter with the new userId), remove the user and custom property
   * User methods; customProperty.create, user.create, user.update, user.getFilter
   *               user.remove, customProperty.remove
   */
  it("Users", async function () {
    const newUserConfig = {
      userDirectory: "TESTING",
      userId: helpers.uuidString(),
    };

    const newCustomProperty = await repoApi.customProperties.create({
      name: helpers.uuidString(),
      choiceValues: [helpers.uuid()],
      objectTypes: ["User"],
    });
    const newUser = await repoApi.users.create(newUserConfig);
    const updateUser = await newUser.update({
      customProperties: [
        `${newCustomProperty.details.name}=${newCustomProperty.details.choiceValues[0]}`,
      ],
    });

    const getNewUser = await repoApi.users.getFilter(
      `name eq '${newUserConfig.userId}'`
    );
    const deleteNewUser = await newUser.remove();
    const deleteCP = await newCustomProperty.remove();

    expect(newUser.details.userDirectory).to.be.equal("TESTING") &&
      expect(getNewUser.length).to.be.equal(1) &&
      expect(getNewUser[0].details.name).to.be.equal(newUserConfig.userId) &&
      expect(newUser.details.customProperties.length).to.be.equal(1) &&
      expect(newUser.details.customProperties[0].value).to.be.equal(
        newCustomProperty.details.choiceValues[0]
      ) &&
      expect(deleteNewUser).to.be.equal(204);
    expect(deleteCP).to.be.equal(204);
  });

  it("Data connections", async function () {
    const connectionConfig = {
      name: "Test data connection",
      connectionString: "C:\\ProgramData\\Qlik\\Sense\\Log",
    };
    const newDataConnection = await repoApi.dataConnections.create(
      connectionConfig
    );

    await newDataConnection.remove();
    const filter = await repoApi.dataConnections.getFilter(
      `name eq '${connectionConfig.name}'`
    );

    expect(newDataConnection.details.connectionstring).to.be.equal(
      connectionConfig.connectionString
    ) &&
      expect(newDataConnection.details.name).to.be.equal(
        connectionConfig.name
      ) &&
      expect(filter.length).to.be.equal(0);
  });

  /**
   * Task operations
   * Used methods:
   */
  it("Reload task", async function () {
    const appName = helpers.uuid();
    const qvf = fs.readFileSync(process.env.IMPORT_APP_FILE);
    const uploadedApp = await repoApi.apps.upload(appName, qvf);

    const newReloadTask1 = await repoApi.reloadTasks.create({
      name: "New reload task 1",
      appId: uploadedApp.details.id,
    });

    const newReloadTask2 = await repoApi.reloadTasks.create({
      name: "New reload task 2",
      appId: uploadedApp.details.id,
    });

    await newReloadTask2.addTriggerComposite({
      name: "Reload on task event",
      eventTasks: [
        {
          state: "success",
          id: newReloadTask1.details.id,
        },
      ],
    });

    await newReloadTask2.addTriggerSchema({
      name: "Reload every day",
      repeat: "Daily",
      repeatEvery: 1,
    });

    const allTasksCountBefore = await repoApi.tasks
      .getAll()
      .then((t) => t.length);

    await newReloadTask2.triggersDetails[0].remove();
    await newReloadTask2.triggersDetails[1].remove();
    await newReloadTask1.remove();
    await newReloadTask2.remove();
    await uploadedApp.remove();

    const allTasksCountAfter = await repoApi.tasks
      .getAll()
      .then((t) => t.length);

    expect(allTasksCountBefore).to.be.greaterThan(allTasksCountAfter);
  });
});