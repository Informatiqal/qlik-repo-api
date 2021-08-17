import { TDaysOfMonth, TDaysOfWeek, TRepeatOptions } from "../types/ranges";

export function schemaRepeat(
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

export function getWeekDayNumber(daysOfWeek: TDaysOfWeek[]): number[] {
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
