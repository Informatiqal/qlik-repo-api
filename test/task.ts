import chai from "chai";
import { Config } from "./Config";

import { ITaskCreate } from "../src/interfaces/argument.interface";

const expect = chai.expect;
const config = new Config();
const repoApi = config.repoApi;

describe("Task operations", function () {
  this.timeout(30000);

  it("Task reload count", async function () {
    let tasksCount = await repoApi.taskReloadCount();

    expect(tasksCount).to.be.greaterThan(0);
  });

  it("Task get all", async function () {
    let tasks = await repoApi.taskGetAll();

    expect(tasks.length).to.be.greaterThan(0);
  });

  it("Task get all reload", async function () {
    let tasks = await repoApi.taskReloadGetAll();

    expect(tasks.length).to.be.greaterThan(0);
  });

  it("Task get all external", async function () {
    let tasks = await repoApi.taskExternalGetAll();

    expect(tasks.length).to.be.greaterThanOrEqual(0);
  });

  it("Task create", async function () {
    let taskDetails: ITaskCreate = {
      name: "Temp task",
      appId: `${process.env.TEST_TASK_APP}`,
    };
    let task = await repoApi.taskCreate(taskDetails);
    let taskDeleteResponse = await repoApi.taskReloadRemove(task.id);

    expect(task.app.id).to.be.equal(`${process.env.TEST_TASK_APP}`) &&
      expect(taskDeleteResponse).to.be.equal(204);
  });
});
