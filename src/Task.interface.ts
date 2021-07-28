import { ICustomPropertyCondensed } from "./CustomProperty";
import { ITagCondensed } from "./Tag";
import { IApp } from "./App";

import {
  TTimeZones,
  TDaysOfMonth,
  TDaysOfWeek,
  TRepeatOptions,
} from "./types/ranges";

export interface ITaskCreate {
  name: string;
  appId: string;
  tags?: string[];
  customProperties?: string[];
}

export interface ITaskReloadUpdate {
  id: string;
  name?: string;
  enabled?: boolean;
  taskSessionTimeout?: number;
  maxRetries?: number;
  tags?: string[];
  customProperties?: string[];
  owner?: string;
}

export type TTaskTriggerCompositeState = "success" | "fail";

export interface ITaskCreateTriggerComposite {
  taskId: string;
  triggerName: string;
  eventTaskId: string;
  state: TTaskTriggerCompositeState;
}

export interface ITaskCreateTriggerSchema {
  reloadTaskId: string;
  name: string;
  repeat?: TRepeatOptions;
  repeatEvery?: number;
  startDate?: string;
  expirationDate?: string;
  daysOfWeek?: TDaysOfWeek;
  daysOfMonth?: TDaysOfMonth;
  timeZone?: TTimeZones;
  daylightSavingTime?: boolean;
}

export interface ISchemaEventOperationalCondensed {
  id?: string;
  privileges?: string[];
  timesTriggered?: number;
  nextExecution?: string;
}

export interface IExternalProgramTaskOperationalCondensed {
  id?: string;
  privileges?: string[];
  timesTriggered?: number;
  nextExecution?: string;
  lastExecutionResult: ITaskExecutionResult;
}

export interface IExternalProgramTaskCondensed {
  id?: string;
  privileges?: string[];
  name: string;
  taskType?: number;
  enabled?: boolean;
  taskSessionTimeout: number;
  maxRetries: number;
  operational: IExternalProgramTaskOperationalCondensed;
}

export interface ISchemaEventCondensed {
  id?: string;
  privileges?: string[];
  name: string;
  enabled?: boolean;
  eventType?: number;
  operational: ISchemaEventOperationalCondensed;
}

export interface ISchemaEvent extends ISchemaEventCondensed {
  createdDate?: string;
  modifiedDate?: string;
  schemaPath?: string;
  timeZone: string;
  startDate: string;
  expirationDate: string;
  schemaFilterDescription: string[];
  incrementalDescription: string;
  incrementalOption: number;
  externalProgramTask: IExternalProgramTaskCondensed;
  reloadTask: IExternalProgramTaskCondensed;
  userSyncTask: IExternalProgramTaskCondensed;
}

export interface IExecutionResultDetailCondensed {
  privileges: string[];
  detailsType: number;
  id: string;
  message: string;
  detailCreatedDate: string;
}

export interface ITaskExecutionResult {
  id: string;
  privileges: string[];
  executingNodeName: string;
  status: {};
  startTime: string;
  stopTime: string;
  duration: number;
  fileReferenceID: string;
  scriptLogAvailable: boolean;
  scriptLogLocation: string;
  scriptLogSize: number;
  details: IExecutionResultDetailCondensed[];
}

export interface ITaskOperational {
  privileges: string[];
  lastExecutionResult: ITaskExecutionResult;
  id: string;
  nextExecution: string;
}

export interface ITaskCondensed {
  id: string;
  name: string;
  taskType: number;
  enabled: boolean;
  maxRetries: number;
  taskSessionTimeout: number;
}

export interface ITask extends ITaskCondensed {
  app: IApp;
  privileges: string[];
  isManuallyTriggered: boolean;
  schemaPath: string;
  operational: ITaskOperational;
  tags: ITagCondensed[];
  createdDate: string;
  customProperties: ICustomPropertyCondensed[];
  modifiedDate: string;
}
