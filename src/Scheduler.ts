import { QlikRepoApi } from "./main";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

import { ISchedulerService, ISchedulerServiceCondensed } from "./interfaces";
import { ISchedulerServiceUpdate } from "./interfaces/argument.interface";

export class Scheduler {
  constructor() {}

  public async schedulerGet(
    this: QlikRepoApi,
    id: string
  ): Promise<ISchedulerService> {
    if (!id) throw new Error(`schedulerGet: "id" parameter is required`);
    return await this.repoClient
      .Get(`schedulerservice/${id}`)
      .then((res) => res.data as ISchedulerService);
  }

  public async schedulerGetAll(
    this: QlikRepoApi
  ): Promise<ISchedulerServiceCondensed[]> {
    return await this.repoClient
      .Get(`schedulerservice`)
      .then((res) => res.data as ISchedulerServiceCondensed[]);
  }

  public async schedulerGetFilter(
    this: QlikRepoApi,
    filter: string
  ): Promise<ISchedulerServiceCondensed[]> {
    if (!filter)
      throw new Error(`schedulerGetFilter: "filter" parameter is required`);

    return await this.repoClient
      .Get(`schedulerservice/full?filter=(${encodeURIComponent(filter)})`)
      .then((res) => res.data as ISchedulerServiceCondensed[]);
  }

  public async schedulerUpdate(
    this: QlikRepoApi,
    arg: ISchedulerServiceUpdate
  ): Promise<ISchedulerService[]> {
    if (!arg.id) throw new Error(`schedulerUpdate: "id" parameter is required`);

    let scheduler = await this.schedulerGet(arg.id);

    if (arg.schedulerServiceType) {
      if (arg.schedulerServiceType == "Master")
        scheduler.settings.schedulerServiceType = 0;
      if (arg.schedulerServiceType == "Slave")
        scheduler.settings.schedulerServiceType = 1;
      if (arg.schedulerServiceType == "MasterAndSlave")
        scheduler.settings.schedulerServiceType = 2;
    }

    if (arg.maxConcurrentEngines) {
      if (arg.maxConcurrentEngines < 1 && arg.maxConcurrentEngines > 256)
        throw new Error(
          `schedulerUpdate: "maxConcurrentEngines" value must be between 1 and 256`
        );

      scheduler.settings.maxConcurrentEngines = arg.maxConcurrentEngines;
    }

    if (arg.engineTimeout) {
      if (arg.engineTimeout < 10 && arg.engineTimeout > 10080)
        throw new Error(
          `schedulerUpdate: "engineTimeout" value must be between 10 and 10080`
        );
      scheduler.settings.engineTimeout = arg.engineTimeout;
    }

    let updateCommon = new UpdateCommonProperties(this, scheduler, arg);
    scheduler = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`schedulerservice/${arg.id}`, scheduler)
      .then((res) => res.data as ISchedulerService[]);
  }
}
