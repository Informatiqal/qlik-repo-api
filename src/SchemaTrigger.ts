import { QlikRepositoryClient } from "qlik-rest-api";
import { ISchemaEvent, ITaskUpdateTriggerSchema } from "./Task.interface";
import { IEntityRemove } from "./types/interfaces";
import { TDaysOfMonth, TDaysOfWeek, TRepeatOptions } from "./types/ranges";

export interface IClassSchemaTrigger {
  remove(): Promise<IEntityRemove>;
  update(arg: ITaskUpdateTriggerSchema): Promise<IEntityRemove>;
  details: ISchemaEvent;
}

export class SchemaTrigger implements IClassSchemaTrigger {
  private id: string;
  private repoClient: QlikRepositoryClient;
  details: ISchemaEvent;
  constructor(
    repoClient: QlikRepositoryClient,
    id: string,
    details?: ISchemaEvent
  ) {
    if (!id) throw new Error(`schemaTrigger.get: "id" parameter is required`);

    this.id = id;
    this.repoClient = repoClient;
    if (details) this.details = details as ISchemaEvent;
  }

  async init() {
    if (!this.details) {
      this.details = await this.repoClient
        .Get(`schemaevent/${this.id}`)
        .then((res) => res.data as ISchemaEvent);
    }
  }

  async remove() {
    return await this.repoClient
      .Delete(`schemaevent/${this.details.id}`)
      .then((r) => {
        return { id: this.details.id, status: r.status } as IEntityRemove;
      });
  }

  async update(arg: ITaskUpdateTriggerSchema) {
    if (arg.enabled !== undefined) this.details.enabled = arg.enabled;
    if (arg.name) this.details.name = arg.name;
    if (arg.startDate) this.details.startDate = arg.startDate;
    if (arg.expirationDate) this.details.expirationDate = arg.expirationDate;
    if (arg.timeZone) this.details.timeZone = arg.timeZone;
    if (arg.daylightSavingTime)
      this.details.daylightSavingTime = arg.daylightSavingTime ? 1 : 0;

    let schemaRepeatOpt = this.schemaRepeat(
      arg.repeat || "Daily",
      arg.repeatEvery || 1,
      arg.daysOfWeek || ["Monday"],
      arg.daysOfMonth || [1]
    );

    if (arg.repeat || arg.repeatEvery || arg.daysOfWeek || arg.daysOfMonth) {
      this.details.schemaFilterDescription = [
        schemaRepeatOpt.schemaFilterDescr,
      ];
      this.details.incrementDescription = schemaRepeatOpt.incrementDescr;
    }

    return await this.repoClient
      .Put(`schemaevent/${this.details.id}`, this.details)
      .then((res) => ({ id: this.details.id, status: res.status }));
  }

  // TODO: repeats in ReloadTaskBase
  private schemaRepeat(
    repeat: TRepeatOptions,
    repeatEvery: number,
    daysOfWeek: TDaysOfWeek[],
    daysOfMonth: TDaysOfMonth[]
  ): { incrementDescr: string; schemaFilterDescr: string } {
    if (repeat == "Once")
      return {
        incrementDescr: "0 0 0 0",
        schemaFilterDescr: "* * - * * * * *",
      };

    if (repeat == "Minute")
      return {
        incrementDescr: `${repeatEvery} 0 0 0`,
        schemaFilterDescr: "* * - * * * * *",
      };

    if (repeat == "Hourly")
      return {
        incrementDescr: `0 ${repeatEvery} 0 0`,
        schemaFilterDescr: "* * - * * * * *",
      };

    if (repeat == "Daily")
      return {
        incrementDescr: `0 0 ${repeatEvery} 0`,
        schemaFilterDescr: "* * - * * * * *",
      };

    if (repeat == "Weekly") {
      let weekDay = this.getWeekDayNumber(daysOfWeek);
      return {
        incrementDescr: `0 0 1 0`,
        schemaFilterDescr: `* * - ${weekDay} ${repeatEvery} * * *`,
      };
    }

    if (repeat == "Monthly")
      return {
        incrementDescr: `0 0 1 0`,
        schemaFilterDescr: `* * - * * ${daysOfMonth} * *`,
      };
  }

  // TODO: repeats in ReloadTaskBase
  private getWeekDayNumber(daysOfWeek: TDaysOfWeek[]): number[] {
    return daysOfWeek.map((d) => {
      if (d == "Sunday") return 0;
      if (d == "Monday") return 1;
      if (d == "Tuesday") return 2;
      if (d == "Wednesday") return 3;
      if (d == "Thursday") return 4;
      if (d == "Friday") return 5;
      if (d == "Saturday") return 6;
    });
  }
}
