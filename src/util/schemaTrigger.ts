import { TDaysOfMonth, TDaysOfWeek, TRepeatOptions } from "../types/ranges";

export function schemaRepeat(
  repeat: TRepeatOptions,
  repeatEvery: number,
  daysOfWeek: TDaysOfWeek[],
  daysOfMonth: TDaysOfMonth[]
): { incrementDescr: string; schemaFilterDescr: string } {
  const schemas = {
    Once: {
      incrementDescr: "0 0 0 0",
      schemaFilterDescr: "* * - * * * * *",
    },
    Minute: {
      incrementDescr: `${repeatEvery} 0 0 0`,
      schemaFilterDescr: "* * - * * * * *",
    },
    Hourly: {
      incrementDescr: `0 ${repeatEvery} 0 0`,
      schemaFilterDescr: "* * - * * * * *",
    },
    Daily: {
      incrementDescr: `0 0 ${repeatEvery} 0`,
      schemaFilterDescr: "* * - * * * * *",
    },
    Weekly: {
      incrementDescr: `0 0 1 0`,
      schemaFilterDescr: `* * - ${getWeekDayNumber(
        daysOfWeek
      )} ${repeatEvery} * * *`,
    },
    Monthly: {
      incrementDescr: `0 0 1 0`,
      schemaFilterDescr: `* * - * * ${daysOfMonth} * *`,
    },
  };

  return schemas[repeat];
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

    return 0;
  });
}
