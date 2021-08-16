import { ICustomPropertyCondensed } from "./CustomProperties";
import { ITagCondensed } from "./Tags";
import { IApp } from "./Apps";

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
  // id: string;
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
  enabled?: boolean;
  name: string;
  eventTasks: {
    id?: string;
    name?: string;
    state: TTaskTriggerCompositeState;
  }[];
}

export interface ITaskUpdateTriggerComposite {
  /**
   * Enable/disable the trigger true or false
   */
  enabled?: boolean;
  /**
   * Name of the trigger
   */
  name?: string;
  /**
   * (Composite events) Array of Reload task(s) on which this trigger is depending
   */
  eventTasks?: {
    /**
     * Reload task ID
     */
    id?: string;
    /**
     * Reload task Name. If ID is provided this is not required
     */
    name?: string;
    /**
     * Trigger on the state of the task "success" or "fail"
     */
    state: TTaskTriggerCompositeState;
  }[];
}

export interface ITaskCreateTriggerSchema {
  // reloadTaskId: string;
  enabled?: boolean;
  name: string;
  repeat?: TRepeatOptions;
  repeatEvery?: number;
  startDate?: string;
  expirationDate?: string;
  daysOfWeek?: TDaysOfWeek[];
  daysOfMonth?: TDaysOfMonth[];
  timeZone?: TTimeZones;
  daylightSavingTime?: boolean;
}

export interface ITaskUpdateTriggerSchema {
  /**
   * Enable/disable the trigger true or false
   */
  enabled?: boolean;
  /**
   * Name of the trigger
   */
  name?: string;
  /**
   * (Schema events) Schedule of the task "Once", "Minute", "Hourly", "Daily", "Weekly", "Monthly"
   */
  repeat?: TRepeatOptions;
  /**
   * (Schema events) How often to repeat the task 1,2,3 ... no applied when "Once" or "Monthly"
   */
  repeatEvery?: number;
  /**
   * (Schema events) When will be the first timestamp to start the trigger. Default is current timestamp
   */
  startDate?: string;
  /**
   * (Schema events) When will be the last timestamp to start the trigger. Default is 9999-01-01T00:00:00.000
   */
  expirationDate?: string;
  /**
   * (Schema events) if "Weekly" schedule provide the day(s) of the week "Monday" ... "Sunday"
   */
  daysOfWeek?: TDaysOfWeek[];
  /**
   * (Schema events) if "Monthly" schedule provide the day(s) of the month 1...31
   */
  daysOfMonth?: TDaysOfMonth[];
  /**
   * (Schema events) Use different timezone. Default is "UTC"
   */
  timeZone?: TTimeZones;
  /**
   * (Schema events) use daylight saving time. true or false, Default is "true"
   */
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
  name?: string;
  taskType?: number;
  enabled?: boolean;
  taskSessionTimeout?: number;
  maxRetries?: number;
  operational?: IExternalProgramTaskOperationalCondensed;
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
  modifiedByUserName?: string;
  schemaPath?: string;
  timeZone: string;
  daylightSavingTime: number;
  startDate: string;
  expirationDate: string;
  schemaFilterDescription: string[];
  incrementDescription: string;
  incrementOption: number;
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

export interface ISelectionEvent {
  id?: string;
  name: string;
  enabled?: boolean;
  eventType?: number;
  privileges?: string[];
  operational?: {
    id?: string;
    nextExecution?: string;
    timesTriggered?: number;
    privileges?: string[];
  };
}

export interface ICompositeEventRuleOperationalCondensed {
  id?: string;
  privileges?: string[];
  timeStamp?: string;
  currentState?: number;
}

export interface ICompositeEventRule {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  schemaPath?: string;
  ruleState?: number;
  reloadTask?: IExternalProgramTaskCondensed;
  userSyncTask?: IExternalProgramTaskCondensed;
  externalProgramTask?: IExternalProgramTaskCondensed;
  operational?: ICompositeEventRuleOperationalCondensed;
}

export interface ICompositeEvent {
  id?: string;
  createdDate?: string;
  modifiedDate?: string;
  modifiedByUserName?: string;
  name?: string;
  enabled?: boolean;
  eventType?: number;
  userSyncTask?: null;
  externalProgramTask?: null;
  privileges: string[];
  schemaPath: string;
  timeConstraint: {
    id?: string;
    createdDate?: string;
    modifiedDate?: string;
    modifiedByUserName?: string;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
    schemaPath?: string;
  };
  operational: {
    id?: string;
    timesTriggered?: number;
    privileges?: string[];
  };
  reloadTask?: IExternalProgramTaskCondensed;
  compositeRules?: ICompositeEventRule[];
}

// export interface IReloadTaskChange {
//   schemaPath?: string;
//   task?: string;
//   compositeEventsToDelete?: string[];
//   schemaEventsToDelete?: string[];
// }
