import { QlikRepositoryClient } from "qlik-rest-api";
import { IEntityRemove } from "./types/interfaces";
import { ISchedulerService, ISchedulerServiceUpdate } from "./Schedulers";
import { UpdateCommonProperties } from "./util/UpdateCommonProps";

export interface IClassScheduler {
  remove(): Promise<IEntityRemove>;
  update(arg: ISchedulerServiceUpdate): Promise<ISchedulerService>;
  details: ISchedulerService;
}

export class Scheduler implements IClassScheduler {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: ISchedulerService;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: ISchedulerService
  ) {
    if (!id)
      throw new Error(`schedulerservice.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`schedulerservice/${this.id}`)
        .then((res) => res.data as ISchedulerService);
    }
  }

  public async remove() {
    return await this.repoClient
      .Delete(`schedulerservice/${this.id}`)
      .then((res) => {
        return { id: this.id, status: res.status } as IEntityRemove;
      });
  }

  public async update(arg: ISchedulerServiceUpdate) {
    if (!arg.id)
      throw new Error(`scheduler.update: "id" parameter is required`);

    if (arg.schedulerServiceType) {
      if (arg.schedulerServiceType == "Master")
        this.details.settings.schedulerServiceType = 0;
      if (arg.schedulerServiceType == "Slave")
        this.details.settings.schedulerServiceType = 1;
      if (arg.schedulerServiceType == "MasterAndSlave")
        this.details.settings.schedulerServiceType = 2;
    }

    if (arg.maxConcurrentEngines) {
      if (arg.maxConcurrentEngines < 1 && arg.maxConcurrentEngines > 256)
        throw new Error(
          `scheduler.update: "maxConcurrentEngines" value must be between 1 and 256`
        );

      this.details.settings.maxConcurrentEngines = arg.maxConcurrentEngines;
    }

    if (arg.engineTimeout) {
      if (arg.engineTimeout < 10 && arg.engineTimeout > 10080)
        throw new Error(
          `scheduler.update: "engineTimeout" value must be between 10 and 10080`
        );
      this.details.settings.engineTimeout = arg.engineTimeout;
    }

    let updateCommon = new UpdateCommonProperties(
      this.repoClient,
      this.details,
      arg
    );
    this.details = await updateCommon.updateAll();

    return await this.repoClient
      .Put(`schedulerservice/${arg.id}`, this.details)
      .then((res) => res.data as ISchedulerService);
  }
}
