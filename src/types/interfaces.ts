export type IHttpStatus = number;

export interface IHttpReturn {
  status: number;
  statusText: string;
  data: any;
}

export interface IEntityRemove {
  /**
   * `ID` of the removed object
   */
  id: string;
  /**
   * `HTTP` response status. If the object is successfully removed the status will be `204`
   */
  status: IHttpStatus;
}

export interface IFileExtensionWhiteListCondensed {
  id: string;
  privileges: string[];
  libraryType: string;
}

export interface IStaticContentReferenceCondensed {
  id: string;
  privileges: string[];
  dataLocation: string;
  logicalPath: string;
  externalPath: string;
  serveOptions: string;
}

export interface IOwner {
  privileges: [];
  userDirectory: string;
  userDirectoryConnectorName: string;
  name: string;
  id: string;
  userId: string;
}

export interface ICustomPropertyObject {
  createdDate: string;
  schemaPath: string;
  modifiedDate: string;
  definition: {
    privileges: [];
    valueType: string;
    name: string;
    choiceValues: string[];
    id: string;
  };
  id: string;
  value: string;
}

export interface IAppExportResponse {
  exportToken: string;
  downloadPath: string;
  schemaPath: string;
  appId: string;
  cancelled: boolean;
}

export interface ISelectionItem {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  schemaPath?: string;
  type: string;
  objectID: string;
  objectName?: string;
}

export interface ISelection {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  schemaPath?: string;
  privileges?: string[];
  items?: ISelectionItem[];
}
