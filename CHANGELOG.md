# Changelog

All notable changes to this project will be documented in this file.

## [0.1.12] - 2022-01-16

### Fixed

- doc exports
- IHttpReturn import fix in `ReloadTaskBase.ts`

## [0.1.11] - 2022-01-16

### Fixed

- dependency updates

## [0.1.10] - 2021-10-15

### Fixed

- `virtualProxy.create` - `name` was not passed to Repo API. Now is mandatory parameter [#39](https://github.com/Informatiqal/qlik-repo-api/issues/39)
- `virtualProxy.update` - `modifiedDate` was not passed to Repo API [#40](https://github.com/Informatiqal/qlik-repo-api/issues/40)
- `certificate.export` - typo in export format [#41](https://github.com/Informatiqal/qlik-repo-api/issues/41)

## [0.1.9] - 2021-09-15

### Changed

- all `update` methods are returning the response details instead of the status

## [0.1.8] - 2021-09-03

### Changed

- the arguments for all methods are object

## [0.1.7] - 2021-08-18

### Changed

- admin changes for separating the tests `tsconfig`

### Fixed

- `genericClient` not being passed in all instances

## [0.1.5] - 2021-08-18

### Changed

- changes related to building the project

## [0.1.3] - 2021-08-17

### Changed

- `contentLibraries.create` method accepts object as parameter instead of named params
- `contentLibrary.export` method with throw an error if the authentication is made with certificates. The export is not done via Repo APIs
- corrected function names in few error messages
- removed `id` from engine update interface
- `engine.update` handling more arguments
- `metadataExport` is moved under `VirtualProxy` class instead of `Proxy`
- `setCentral` is moved under `Node` class instead of `ServiceCluster`

### Fixed

- engine init uses the correct endpoint (instead of `tag`)
- sharedContent get uses the internal `id`

### Added

- Oidc arguments are processed in Proxy/VirtualProxy
- attribute parsing functions are in separate file (multiple files are using them)
- schema trigger specific functions are in separate file (multiple files are using them)

## [0.1.2] - 2021-08-17

### Added

- `nodes.register` method implemented. Not sure if its working. Have to be tested somehow

## [0.1.1] - 2021-08-17

### Added

- User directory connector - create and update methods
- User directory connector - updated the interfaces/types

## [0.1.0] - 2021-08-16

### Changed

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

### Changed

- all methods, working with Update/GetCommonProperties are passing the correct argument and types

### Fixed

- `UpdateCommonProperties` and `GetCommonProperties` are adapted to work with the new code structure

## [0.0.21] - 2021-07-29

### Changed

- all error messages are changed to return the function name in the new format - `xxx.yyy:` instead of `yyy:`

### Added

- whenever is relevant there is `xxx.removeFilter` method
- whenever is relevant there is `xxx.select` method

## [0.0.20] - 2021-07-28

### Changed

- the codebase was overwritten
- interfaces and types are closer to the class implementation (inside it or in xxx.interface.ts file)

## [0.0.19] - 2021-07-26

### Changed

- all `xxxRemoveFilter` methods internally are using `xxxRemove` instead duplicating the url request

## [0.0.18] - 2021-07-26

### Added

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

### Changed

- for all `xxxGet` methods the `id` parameter is mandatory
- all `xxGet` methods are returning `Ixxx`

## [0.0.17] - 2021-07-26

### Added

- `proxyCreate` method
- `proxyUpdate` method

## [0.0.16] - 2021-07-26

### Added

- `sharedContentGet` method
- `sharedContentGetFilter` method
- `sharedContentRemove` method
- `sharedContentUploadFile` method
- `sharedContentDeleteFile` method
- `sharedContentUpdate` method
- `sharedContentCreate` method

## [0.0.15] - 2021-07-26

### Added

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

### Added

- `certificateExport` method
- `certificateDistributionPathGet` method

## [0.0.12] - 2021-07-25

### Added

- `privilegesGet` method
- `privilegesAssert` method

## [0.0.11] - 2021-07-24

### Added

- `appObjectGet` method
- `appObjectGetFilter` method
- `appObjectPublish` method
- `appObjectUnPublish` method
- `appObjectRemove` method
- `appObjectUpdate` method

## [0.0.10] - 2021-07-24

### Changed

- `xxxGet` if `id` is provided the returned data is `Ixxx[]` if not `IxxxCondensed[]`
- all `xxxGet` are returning an array
- for all `xxxGet` `id` is optional
- uuid checks are removed (including the methods for them)

## [0.0.9] - 2021-07-24

### Added

- `dataConnectionGet` method
- `dataConnectionGetFilter` method
- `dataConnectionRemove` method
- `dataConnectionCreate` method
- `dataConnectionUpdate` method
  `

## [0.0.8] - 2021-07-24

### Added

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

### Added

- `userDirectoryCount` method
- `userDirectoryGet` method
- `userDirectoryGetFilter` method
- `userDirectoryRemove` method
- `userDirectoryRemoveFilter` method
- `userDirectorySync` method

## [0.0.5] - 2021-07-22

### Added

- `serviceStatusCount` method
- `serviceStatusGet` method
- `serviceStatusGetFilter` method

## [0.0.4] - 2021-07-22

### Added

- `serviceClusterCount` method
- `serviceClusterGet` method
- `serviceClusterGetFilter` method
- `serviceClusterRemove` method
- `serviceClusterRemoveFilter` method
- `serviceClusterSetCentral` method
- `serviceClusterUpdate` method

## [0.0.3] - 2021-07-22

### Added

- `appUploadReplace` method
- `genericRepoClient` exposed. Used for all Repository endpoints which dont have `/qrs` prefix (for example `/tempcontent` endpoints)
- `genericWESClient` exposed. Used for `Web Extension Service API` endpoints. With port `9080`. For example `exportExtension` is one of these methods
- `Phase 1` test are started

### Changed

- `appImport` method is renamed to `appUpload`
- `appExport` correctly returns the app content as `Buffer`
- `extensionExport` correctly returns the app content as `Buffer`
- `tagRemoveFilter` throws an error when 0 items are returned
- all `xxxRemove` methods are returning data in `IHttpReturnRemove` format (`{ id, status }`)

### Removed

- `exportExtension` method. This is not part of Repository APIs
- `modifiedByUserName` parameter is no longer an option

## [0.0.2] - 2021-07-20

### Added

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

### Changed

- for all `xxxGet` methods the `id` parameter is optional (it used to be mandatory). If `id` is not specified all objects are returned
- by default all `xxxGetFilter` methods return the `/full` endpoint
- `contentLibraryCreate` method now accept custom properties and tags parameters
- `userCreate` method now accept custom properties and tags parameters
- `streamCreate` method now accept custom properties and tags parameters
