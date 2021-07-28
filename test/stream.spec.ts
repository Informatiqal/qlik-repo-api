// import chai from "chai";
// import { Config } from "./Config";

// const expect = chai.expect;
// const config = new Config();
// const repoApi = config.repoApi;

// describe("Stream operations", function () {
//   this.timeout(30000);

//   it("Create and delete stream", async function () {
//     let newStreamName = "Rest API Test";

//     let newStream = await repoApi.streamCreate({
//       name: newStreamName,
//       customProperties: ["MonthlyMeeting1=Value 1", "MonthlyMeeting=Value 2"],
//       // tags: ["blah0", "blah1"],
//     });
//     // let deleteStream = await repoApi.streamRemove(newStream.id);

//     expect(true).to.be.true;
//     // expect(newTag.name).to.equal(newTagName) &&
//     //   expect(deleteTag.status).to.equal(204) &&
//     //   expect(deleteTag.id).to.equal(newTag.id);
//   });
// });
