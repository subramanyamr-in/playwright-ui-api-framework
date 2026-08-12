import {
  addBusinessDays,
  addDays,
  addHours,
  addMinutes,
  addMonths,
  addWeeks,
  format as dateFnsFormat,
  setHours,
  setSeconds,
  startOfHour,
  subDays,
} from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// -----------------------------------------------------------------------------
// DateUtils - Comprehensive Date & Time Operations Utility
//
// PURPOSE:
// - Provides helper functions for timezone conversions, ISO 8601 formatting,
//   date arithmetic (days, hours, business days, months), and weekday calculations.
// -----------------------------------------------------------------------------

export enum numberOfDayInWeek {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

export type NumberOfDayInWeek = numberOfDayInWeek;

export class DateUtils {
  // -----------------------------------------------------------------------------
  // PRIVATE HELPER METHODS
  // -----------------------------------------------------------------------------

  /**
   * Converts a given Date object into a specific timezone.
   *
   * @param date - The Date object to transform.
   * @param timeZone - The IANA timezone string (e.g., 'America/New_York', 'UTC').
   * @returns Date converted to the target timezone.
   */
  private static getDateInTimeZone(date: Date, timeZone: string): Date {
    return toZonedTime(date, timeZone);
  }

  /**
   * Gets the current date truncated to the start of the current hour.
   *
   * @returns Current Date rounded to top of the hour.
   */
  private static getCurrentDate(): Date {
    const currentDate = new Date();
    return startOfHour(currentDate);
  }

  // -----------------------------------------------------------------------------
  // ISO & FORMATTED DATE GENERATION
  // -----------------------------------------------------------------------------

  /**
   * Formats a Date object using a specified format pattern.
   *
   * @param date - The Date object to format (defaults to current date/time).
   * @param format - The date-fns format pattern string (defaults to 'yyyy-MM-dd HH:mm:ss').
   * @returns Formatted date string.
   */
  public static getDateWithFormat(
    date: Date = new Date(),
    format: string = 'yyyy-MM-dd HH:mm:ss'
  ): string {
    return dateFnsFormat(date, format);
  }

  /**
   * Formats a given Date to ISO 8601 format truncated to the start of the hour.
   *
   * @param date - The Date object to format.
   * @returns ISO 8601 formatted date string (`YYYY-MM-DDTHH:mm:ss.sssZ`).
   */
  public static getDateISOTime(date: Date): string {
    const formatted = startOfHour(date);
    return formatted.toISOString();
  }

  /**
   * Gets the current time in ISO 8601 format truncated to the top of the hour.
   *
   * @returns Current time as ISO 8601 string.
   */
  public static getCurrentISOTime(): string {
    const now = new Date();
    return this.getDateISOTime(now);
  }

  /**
   * Generates a date range starting 20 days prior to today and ending one year after the start date.
   *
   * @returns An object containing `startDateUtc` and `endDateUtc` in ISO 8601 format.
   */
  public static getUtcDates(): { startDateUtc: string; endDateUtc: string } {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 20);
    const startDateUtc: string = this.getDateISOTime(startDate);
    startDate.setUTCFullYear(startDate.getUTCFullYear() + 1);
    const endDateUtc: string = this.getDateISOTime(startDate);
    return { startDateUtc, endDateUtc };
  }

  // -----------------------------------------------------------------------------
  // TIMEZONE & SPECIFIC HOUR CALCULATIONS
  // -----------------------------------------------------------------------------

  /**
   * Converts a specific date and time into a target timezone.
   *
   * @param date - The specific Date instance.
   * @param timeZone - Target timezone identifier.
   * @returns Date transformed to target timezone.
   */
  public static getDateSpecificDay(date: Date, timeZone: string): Date {
    const roundedHourDate = date;
    const dateInLocalTZ = setHours(roundedHourDate, date.getHours());
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Gets the current date at a specific hour converted to a target timezone.
   *
   * @param timeZone - Target timezone identifier.
   * @param hours - The hour of the day (0–23).
   * @returns Date instance at the specified hour in the given timezone.
   */
  public static getCurrentDateSpecificHour(timeZone: string, hours: number): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = setHours(roundedHourDate, hours);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Calculates a future date by adding hours to the current time in a target timezone.
   *
   * @param timeZone - Target timezone identifier.
   * @param hoursLater - Number of hours to add.
   * @returns Future Date in target timezone.
   */
  public static getFutureHours(timeZone: string, hoursLater: number): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = this.moveDateHours(roundedHourDate, hoursLater);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  // -----------------------------------------------------------------------------
  // DATE & TIME ARITHMETIC (HOURS, DAYS, WEEKS, MONTHS)
  // -----------------------------------------------------------------------------

  /**
   * Adds a specified number of hours to a date.
   *
   * @param date - Base Date instance.
   * @param hoursLater - Number of hours to add.
   * @returns New Date with hours added.
   */
  public static moveDateHours(date: Date, hoursLater: number): Date {
    return addHours(date, hoursLater);
  }

  /**
   * Sets the hour of a given date.
   *
   * @param date - Base Date instance.
   * @param hours - Hour to set (0–23).
   * @returns New Date instance with updated hour.
   */
  public static setDateHours(date: Date, hours: number): Date {
    return setHours(date, hours);
  }

  /**
   * Adds a specified number of days to a date without mutating the original.
   *
   * @param date - Base Date instance.
   * @param days - Number of days to add.
   * @returns New Date with days added.
   */
  public static addDays(date: Date, days: number): Date {
    return addDays(date, days);
  }

  /**
   * Adds or subtracts minutes to/from a date without mutating the original object.
   *
   * @param date - Base Date instance.
   * @param minutes - Number of minutes to add (or subtract if negative).
   * @returns New Date instance with modified minutes.
   */
  public static addMinutes(date: Date, minutes: number): Date {
    return addMinutes(date, minutes);
  }

  /**
   * Adds weeks to current date and converts to target timezone.
   *
   * @param timeZone - Target timezone identifier.
   * @param weeksLater - Number of weeks to add.
   * @returns Date in target timezone.
   */
  public static getFutureWeek(timeZone: string, weeksLater: number): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = addWeeks(roundedHourDate, weeksLater);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Adds months to current date and converts to target timezone.
   *
   * @param timeZone - Target timezone identifier.
   * @param monthsLater - Number of months to add.
   * @returns Date in target timezone.
   */
  public static getFutureMonths(timeZone: string, monthsLater: number): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = addMonths(roundedHourDate, monthsLater);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Subtracts days from current date and converts to target timezone.
   *
   * @param timeZone - Target timezone identifier.
   * @param daysBefore - Number of days to subtract.
   * @returns Date in target timezone.
   */
  public static getPreviousDays(timeZone: string, daysBefore: number): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = subDays(roundedHourDate, daysBefore);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Calculates a future date in target timezone by adding calendar days.
   *
   * @param timeZone - Target timezone identifier.
   * @param daysLater - Number of days to add.
   * @returns Date in target timezone.
   */
  public static getFutureDays(timeZone: string, daysLater: number): Date {
    const roundedHourDate = this.getCurrentDate();
    const dateInLocalTZ = addDays(roundedHourDate, daysLater);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  // -----------------------------------------------------------------------------
  // BUSINESS DAYS & WEEKDAY COMPUTATIONS
  // -----------------------------------------------------------------------------

  /**
   * Calculates future business days from current date in target timezone, optionally setting hours/minutes.
   *
   * @param timeZone - Target timezone identifier.
   * @param daysLater - Number of business days to add.
   * @param hour - Optional hour to set (0–23).
   * @param minutes - Optional minutes to set (0–59).
   * @returns Date in target timezone.
   */
  public static getFutureBusinessDays(
    timeZone: string,
    daysLater: number,
    hour?: number,
    minutes?: number
  ): Date {
    const roundedHourDate = this.getCurrentDate();
    if (hour !== undefined) roundedHourDate.setHours(hour);
    if (minutes !== undefined) roundedHourDate.setMinutes(minutes);
    const dateInLocalTZ = addBusinessDays(roundedHourDate, daysLater);
    return this.getDateInTimeZone(dateInLocalTZ, timeZone);
  }

  /**
   * Adds business days to a given Date object.
   *
   * @param date - Base Date instance.
   * @param daysLater - Number of business days to add.
   * @returns New Date with business days added.
   */
  public static addFutureBusinessDays(date: Date, daysLater: number): Date {
    return addBusinessDays(date, daysLater);
  }

  /**
   * Resolves the next occurrence of a specific weekday from a reference date.
   *
   * @param dayOfWeek - Day of the week from `numberOfDayInWeek` enum (1 = Monday ... 7 = Sunday).
   * @param timeZone - Target timezone identifier.
   * @param excludeToday - If true, skips today if today is the target weekday.
   * @param refDate - Starting reference date (defaults to now).
   * @returns Next target weekday Date in target timezone.
   */
  public static getNextDayOfTheWeek(
    dayOfWeek: numberOfDayInWeek,
    timeZone: string,
    excludeToday: boolean = true,
    refDate: Date = new Date()
  ): Date {
    refDate.setHours(14);
    refDate.setDate(
      refDate.getDate() +
        +!!excludeToday +
        ((dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7)
    );
    return this.getDateInTimeZone(refDate, timeZone);
  }

  // -----------------------------------------------------------------------------
  // TIMERS & TIME FORMATTING
  // -----------------------------------------------------------------------------

  /**
   * Starts a high-resolution timer.
   *
   * @returns High-resolution real time in nanoseconds as bigint.
   */
  public static async getCurrentTime(): Promise<bigint> {
    return process.hrtime.bigint();
  }

  /**
   * Converts a 24-hour hour number to a 12-hour formatted string with AM/PM.
   *
   * @param hour - Hour in 24-hour format (0 to 23).
   * @param half - If true, appends ':30' minutes instead of ':00'.
   * @param startWithZero - If true, pads single digit hours with leading zero.
   * @returns Formatted 12-hour time string (e.g., '06:30 PM').
   * @throws Error if hour is outside 0–23 range.
   */
  public static formatHourTo12Hour(hour: number, half = false, startWithZero = false): string {
    if (hour < 0 || hour > 23) {
      throw new Error('Hour must be between 0 and 23');
    }

    const period = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    const formattedHour = startWithZero ? hour12.toString().padStart(2, '0') : hour12.toString();
    const minutes = half ? '30' : '00';

    return `${formattedHour}:${minutes} ${period}`;
  }

  /**
   * Rounds minutes of a date up or down to the nearest interval threshold.
   *
   * @param date - Date to round.
   * @param down - If true, rounds down; otherwise rounds up.
   * @param round - Number of intervals per hour (defaults to 12 -> 5 min intervals).
   * @returns Rounded Date instance.
   */
  public static roundMinutes(date: Date, down = false, round = 12): Date {
    const threshold = 60 / round;
    const offset = date.getMinutes() % threshold;
    const difference = (!down ? threshold : 0) - offset;
    return this.addMinutes(setSeconds(date, 0), difference);
  }
}
