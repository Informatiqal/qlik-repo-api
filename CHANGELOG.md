# Changelog

All notable changes to this project will be documented in this file.

## [0.0.10] - 2021-07-XX

### Added

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

## [0.0.7] - 2021-07-27

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