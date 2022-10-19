# Changelog

All notable changes to this project will be documented in this file.

## [0.2.21] - 2022-05-15

- [fix] `serviceStatus.getAll` is returning the `full` data [#101](https://github.com/Informatiqal/qlik-repo-api/issues/101)
- [added] Notification endpoints added (`create`, `delete` and `changes`) [#99](https://github.com/Informatiqal/qlik-repo-api/issues/99)
- dependency updates

## [0.2.20] - 2022-04-27

- [fix] (internal) no more circular dependencies [#95](https://github.com/Informatiqal/qlik-repo-api/issues/95)
- [fix] interfaces are moved into separate file [#94](https://github.com/Informatiqal/qlik-repo-api/issues/94)
- [fix] review of most of create/update methods and make sure that they accept custom properties and tags [#58](https://github.com/Informatiqal/qlik-repo-api/issues/58)

## [0.2.19] - 2022-04-21

- [fix] `contentLibrary.export` and `contentLibrary.exportMany` return the full path as well [#65](https://github.com/Informatiqal/qlik-repo-api/issues/65)
- dependency updates

## [0.2.18] - 2022-03-29

- [fix] `externalTask.update` and `reloadTask.update` are now two different methods. Both object share a lot in common but the update methods are slightly different (in arguments). `reloadTask` **accept** `appId` and `appFilter` and `externalTask` is accepting `path` and `parameters` [#64](https://github.com/Informatiqal/qlik-repo-api/issues/64)

## [0.2.17] - 2022-03-20

- Dependency updates
- `externalTask.create` also populates the `triggerDetails` (same logs as in `reloadTask.create`)

## [0.2.16] - 2022-03-13

- Dependency updates

## [0.2.15] - 2022-02-21

- [fix] `reloadTask.create` populates `triggersDetails` (empty array)

## [0.2.14] - 2022-02-21

- [added] `reloadTask.removeAllTriggers` and `externalTask.removeAllTriggers` methods are implemented

- [fix[ `reloadTask.update` and `externalTask.update` will update the task name as well (`name` was missing from the logic)

## [0.2.13] - 2022-02-21

- **BREAKING** `reloadTasks.create` `id` argument is rolled back to `appId`

## [0.2.12] - 2022-02-19

- **BREAKING** `reloadTasks.create` argument `appId` renamed to `id`

## [0.2.11] - 2022-02-19

- [fix] When fetching reload/external task details the triggers data is also fetched

## [0.2.10] - 2022-02-18

- [fix] Creating task trigger (Schema) require mandatory `repeat` parameter to be passed. Previously this parameter was optional
- [fix] Creating task triggers (Schema, Composite or Many) now returns the instance of the triggers, instead of the response status

## [0.2.9] - 2022-02-15

- [fix] passing new instance of the generic client class (with port). Needed for `app.exportMany`
- [added] new method `app.exportMany`. Exports apps based on provided filter. Optional parameter `skipData` is applied to all apps returned by the filter query

## [0.2.8] - 2022-02-15

- [fix] corrected url formatting when calling `app.export` with virtual proxy prefix

## [0.2.7] - 2022-02-14

- [change] `contentLibrary.exportMany` is correctly using `contentLibrary.export` in the background. This way the correct error message is thrown when certificates authentication is used

## [0.2.6] - 2022-02-14

- **BREAKING** `certificate.export` is renamed to `certificate.generate`
- `app.export` is returning the app name as well (`<appID>.qvf`)

## [0.2.5] - 2022-02-14

- [change] `contentLibrary.export` - this method now target specific file and its not possible to export all files through this methods. For multiple files export have a look at `contentLibrary.exportMany`
- [add] new method `contentLibrary.exportMany`. This method can export either all files in the library (if no params are provided) or a list of provided file names (the base file name)
- [add] tests to cover export functionality for content library

## [0.2.4] - 2022-02-14

- `app.export` accepts `token` as **optional** parameter. If not provided the method will auto-generate
- `app.export` no longer accepts `fileName` (was not used anyway)
- `app.export` correctly returns the exported content (via `QlikGenericRestClient`)
- `app.export` returns the `exportToken` as well
- [add] `ExternalProgramTask` to custom properties object types
- [add] test for app export

## [0.2.3] - 2022-02-13

- [fix] `task.getFilter` is using the correct url endpoints [#59](https://github.com/Informatiqal/qlik-repo-api/issues/59)
- [fix] external tasks are semi-separated from reload tasks abstract class. Some methods are not available for external tasks but available for reload tasks [#60](https://github.com/Informatiqal/qlik-repo-api/issues/60)
- [add] test for external task(s)

## [0.2.2] - 2022-02-10

- Virtual proxies changes. Header authentication, extended security, sameSite properties are parsed

## [0.2.1] - 2022-02-09

- `contentLibrary.importFile` - moved the method from `contentLibraries` and renamed to `importFile` instead of `import` [#55](https://github.com/Informatiqal/qlik-repo-api/issues/55)
- `contentLibrary.importFileMany` - import bulk files to content library [#54](https://github.com/Informatiqal/qlik-repo-api/issues/54)
- `contentLibrary.removeFile` - remove single file from content library [#56](https://github.com/Informatiqal/qlik-repo-api/issues/56)
- `contentLibrary.removeFileMany` - remove bulk files from content library [#56](https://github.com/Informatiqal/qlik-repo-api/issues/56)
- [fix] Weekly schema trigger correctly retrieves the days number representation [#51](https://github.com/Informatiqal/qlik-repo-api/issues/51)
- [fix] `extensions.import` now accepts `tags`, `customProperties` and `owner` [#52](https://github.com/Informatiqal/qlik-repo-api/issues/52) params

## [0.2.0] - 2022-02-07

- all methods expose only the required properties. Removed exposure of `repoClient` or `genericClient` or `id`. Whenever available these properties should be kept internal to the class [#49](https://github.com/Informatiqal/qlik-repo-api/issues/49)

## [0.1.14] - 2022-02-07

- `reloadTask.create` and `reloadTask.update` accepts and `appFilter` argument [#47](https://github.com/Informatiqal/qlik-repo-api/issues/47)

## [0.1.14] - 2022-01-24

- customer property (update and create) - check if the provided name is alphanumeric ([#42](https://github.com/Informatiqal/qlik-repo-api/issues/42))
- custom property update - `name` is no longer mandatory parameter

## [0.1.13] - 2022-01-16

- when updating object's tags (#44) or custom properties (#43) the values can be appended to the object instead of being overwritten (#45)

## [0.1.12] - 2022-01-16

- doc exports
- IHttpReturn import fix in `ReloadTaskBase.ts`

## [0.1.11] - 2022-01-16

- dependency updates

## [0.1.10] - 2021-10-15

- `virtualProxy.create` - `name` was not passed to Repo API. Now is mandatory parameter [#39](https://github.com/Informatiqal/qlik-repo-api/issues/39)
- `virtualProxy.update` - `modifiedDate` was not passed to Repo API [#40](https://github.com/Informatiqal/qlik-repo-api/issues/40)
- `certificate.export` - typo in export format [#41](https://github.com/Informatiqal/qlik-repo-api/issues/41)

## [0.1.9] - 2021-09-15

- all `update` methods are returning the response details instead of the status

## [0.1.8] - 2021-09-03

- the arguments for all methods are object

## [0.1.7] - 2021-08-18

- admin changes for separating the tests `tsconfig`

- `genericClient` not being passed in all instances

## [0.1.5] - 2021-08-18

- changes related to building the project

## [0.1.3] - 2021-08-17

- `contentLibraries.create` method accepts object as parameter instead of named params
- `contentLibrary.export` method with throw an error if the authentication is made with certificates. The export is not done via Repo APIs
- corrected function names in few error messages
- removed `id` from engine update interface
- `engine.update` handling more arguments
- `metadataExport` is moved under `VirtualProxy` class instead of `Proxy`
- `setCentral` is moved under `Node` class instead of `ServiceCluster`
- [fix] engine init uses the correct endpoint (instead of `tag`)
- [fix] sharedContent get uses the internal `id`
- [add] Oidc arguments are processed in Proxy/VirtualProxy
- [add] attribute parsing functions are in separate file (multiple files are using them)
- [add] schema trigger specific functions are in separate file (multiple files are using them)

## [0.1.2] - 2021-08-17

- `nodes.register` method implemented. Not sure if its working. Have to be tested somehow

## [0.1.1] - 2021-08-17

- User directory connector - create and update methods
- User directory connector - updated the interfaces/types

## [0.1.0] - 2021-08-16

- A lot had been changed. All `get` methods are returning instance of classes which expose their on methods. For example:

```javascript
const qlikApp = await repoApi.apps.get("some-app-id-here");

// At this point qlikApp will have the app details
const appName = qlikApp.details.name;

// all app methods will be exposed:

await qlikApp.update({
  name: "new-app-name",
});

await qlikApp.remove();
```

- basic tests for Phase 1 are in place. More tests should/will be added
- various bugs were fixed while writing the tests

## [0.0.22] - 2021-07-29

- all methods, working with Update/GetCommonProperties are passing the correct argument and types
- [fix] `UpdateCommonProperties` and `GetCommonProperties` are adapted to work with the new code structure

## [0.0.21] - 2021-07-29

- all error messages are changed to return the function name in the new format - `xxx.yyy:` instead of `yyy:`
- whenever is relevant there is `xxx.removeFilter` method
- whenever is relevant there is `xxx.select` method

## [0.0.20] - 2021-07-28

- the codebase was overwritten
- interfaces and types are closer to the class implementation (inside it or in xxx.interface.ts file)

## [0.0.19] - 2021-07-26

- all `xxxRemoveFilter` methods internally are using `xxxRemove` instead duplicating the url request

## [0.0.18] - 2021-07-26

- `appGetAll` method
- `appObjectGetAll` method
- `contentLibraryGetAll` method
- `customPropertyGetAll` method
- `dataConnectionGetAll` method
- `extensionGetAll` method
- `engineGetAll` method
- `nodeGetAll` method
- `proxyGetAll` method
- `virtualProxyGetAll` method
- `sharedContentGetAll` method
- `schedulerGetAll` method
- `serviceClusterGetAll` method
- `serviceStatusGetAll` method
- `streamGetAll` method
- `ruleGetAll` method
- `tagGetAll` method
- `taskGetAll` method
- `taskReloadGetAll` method
- `taskExternalGetAll` method
- `taskScheduleGetAll` method
- `userGetAll` method
- `userDirectoryGetAll` method
- [change] for all `xxxGet` methods the `id` parameter is mandatory
- [change] all `xxGet` methods are returning `Ixxx`

## [0.0.17] - 2021-07-26

- `proxyCreate` method
- `proxyUpdate` method

## [0.0.16] - 2021-07-26

- `sharedContentGet` method
- `sharedContentGetFilter` method
- `sharedContentRemove` method
- `sharedContentUploadFile` method
- `sharedContentDeleteFile` method
- `sharedContentUpdate` method
- `sharedContentCreate` method

## [0.0.15] - 2021-07-26

- `proxyGet` method
- `proxyGetFilter` method
- `proxyMetadataExport` method
- `proxyAdd` method
- `virtualProxyGet` method
- `virtualProxyGetFilter` method
- `virtualProxyRemove` method
- `virtualProxyUpdate` method
- `schedulerGet` method
- `schedulerGetFilter` method
- `schedulerUpdate` method

## [0.0.13] - 2021-07-25

- `certificateExport` method
- `certificateDistributionPathGet` method

## [0.0.12] - 2021-07-25

- `privilegesGet` method
- `privilegesAssert` method

## [0.0.11] - 2021-07-24

- `appObjectGet` method
- `appObjectGetFilter` method
- `appObjectPublish` method
- `appObjectUnPublish` method
- `appObjectRemove` method
- `appObjectUpdate` method

## [0.0.10] - 2021-07-24

- `xxxGet` if `id` is provided the returned data is `Ixxx[]` if not `IxxxCondensed[]`
- all `xxxGet` are returning an array
- for all `xxxGet` `id` is optional
- uuid checks are removed (including the methods for them)

## [0.0.9] - 2021-07-24

- `dataConnectionGet` method
- `dataConnectionGetFilter` method
- `dataConnectionRemove` method
- `dataConnectionCreate` method
- `dataConnectionUpdate` method
  `

## [0.0.8] - 2021-07-24

- `licenseAccessTypeInfoGet` method
- `licenseGet` method
- `licenseAnalyzerAccessTypeGet` method
- `licenseAnalyzerAccessTypeRemove` method
- `licenseProfessionalAccessTypeGet` method
- `licenseProfessionalAccessTypeRemove` method
- `licenseUserAccessTypeGet` method
- `licenseUserAccessTypeRemove` method
- `licenseLoginAccessTypeGet` method
- `licenseLoginAccessTypeRemove` method
- `licenseAuditGet` method
- `licenseSetSerial` method
- `licenseSetKey` method
- `licenseProfessionalAccessGroupCreate` method
- `licenseUserAccessGroupCreate` method

## [0.0.7] - 2021-07-23

### Added

- `nodeCount` method
- `nodeGet` method
- `nodeGetFilter` method
- `nodeRemove` method
- `nodeRemoveFilter` method
- `nodeUpdate` method
- `nodeCreate` method

## [0.0.6] - 2021-07-23

- `userDirectoryCount` method
- `userDirectoryGet` method
- `userDirectoryGetFilter` method
- `userDirectoryRemove` method
- `userDirectoryRemoveFilter` method
- `userDirectorySync` method

## [0.0.5] - 2021-07-22

- `serviceStatusCount` method
- `serviceStatusGet` method
- `serviceStatusGetFilter` method

## [0.0.4] - 2021-07-22

- `serviceClusterCount` method
- `serviceClusterGet` method
- `serviceClusterGetFilter` method
- `serviceClusterRemove` method
- `serviceClusterRemoveFilter` method
- `serviceClusterSetCentral` method
- `serviceClusterUpdate` method

## [0.0.3] - 2021-07-22

- `appUploadReplace` method
- `genericRepoClient` exposed. Used for all Repository endpoints which dont have `/qrs` prefix (for example `/tempcontent` endpoints)
- `genericWESClient` exposed. Used for `Web Extension Service API` endpoints. With port `9080`. For example `exportExtension` is one of these methods
- `Phase 1` test are started
- `appImport` method is renamed to `appUpload`
- `appExport` correctly returns the app content as `Buffer`
- `extensionExport` correctly returns the app content as `Buffer`
- `tagRemoveFilter` throws an error when 0 items are returned
- all `xxxRemove` methods are returning data in `IHttpReturnRemove` format (`{ id, status }`)
- [removed] `exportExtension` method. This is not part of Repository APIs
- [removed] `modifiedByUserName` parameter is no longer an option

## [0.0.2] - 2021-07-20

- `orderBy` parameter for all `xxxGetFilter`
- `appSelect` method
- `contentLibraryExport` method
- `contentLibraryImport` method
- `customPropertySelect` method
- `engineGetValid` method
- `ruleGetAudit` method
- `ruleLicenseCreate` method
- `taskScriptLogGet` method
- `taskScriptLogFileGet` method
- interfaces for the above methods
- for all `xxxGet` methods the `id` parameter is optional (it used to be mandatory). If `id` is not specified all objects are returned
- by default all `xxxGetFilter` methods return the `/full` endpoint
- `contentLibraryCreate` method now accept custom properties and tags parameters
- `userCreate` method now accept custom properties and tags parameters
- `streamCreate` method now accept custom properties and tags parameters
