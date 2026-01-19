/* eslint-disable class-methods-use-this */
// Compatibility adapter copied from MUI AdapterDateFns with root date-fns imports.
import {
  addDays,
  addSeconds,
  addMinutes,
  addHours,
  addWeeks,
  addMonths,
  addYears,
  endOfDay,
  endOfWeek,
  endOfYear,
  format as dateFnsFormat,
  getDate,
  getDaysInMonth,
  getHours,
  getMinutes,
  getMonth,
  getSeconds,
  getMilliseconds,
  getWeek,
  getYear,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  isSameYear,
  isSameMonth,
  isSameHour,
  isValid,
  parse as dateFnsParse,
  setDate,
  setHours,
  setMinutes,
  setMonth,
  setSeconds,
  setMilliseconds,
  setYear,
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  startOfYear,
  isWithinInterval,
} from 'date-fns';
import { longFormatters } from 'date-fns/format';
import { enUS } from 'date-fns/locale/en-US';
import { AdapterDateFnsBase } from '@mui/x-date-pickers/AdapterDateFnsBase';

export class AdapterDateFns extends AdapterDateFnsBase {
  constructor({ locale, formats } = {}) {
    super({
      locale: locale ?? enUS,
      formats,
      longFormatters,
    });

    this.parse = (value, format) => {
      if (value === '') {
        return null;
      }
      return dateFnsParse(value, format, new Date(), {
        locale: this.locale,
      });
    };

    this.isValid = (value) => {
      if (value == null) {
        return false;
      }
      return isValid(value);
    };

    this.format = (value, formatKey) => {
      return this.formatByString(value, this.formats[formatKey]);
    };

    this.formatByString = (value, formatString) => {
      return dateFnsFormat(value, formatString, {
        locale: this.locale,
      });
    };

    this.isEqual = (value, comparing) => {
      if (value === null && comparing === null) {
        return true;
      }
      if (value === null || comparing === null) {
        return false;
      }
      return isEqual(value, comparing);
    };

    this.isSameYear = (value, comparing) => {
      return isSameYear(value, comparing);
    };

    this.isSameMonth = (value, comparing) => {
      return isSameMonth(value, comparing);
    };

    this.isSameDay = (value, comparing) => {
      return isSameDay(value, comparing);
    };

    this.isSameHour = (value, comparing) => {
      return isSameHour(value, comparing);
    };

    this.isAfter = (value, comparing) => {
      return isAfter(value, comparing);
    };

    this.isAfterYear = (value, comparing) => {
      return isAfter(value, endOfYear(comparing));
    };

    this.isAfterDay = (value, comparing) => {
      return isAfter(value, endOfDay(comparing));
    };

    this.isBefore = (value, comparing) => {
      return isBefore(value, comparing);
    };

    this.isBeforeYear = (value, comparing) => {
      return isBefore(value, this.startOfYear(comparing));
    };

    this.isBeforeDay = (value, comparing) => {
      return isBefore(value, this.startOfDay(comparing));
    };

    this.isWithinRange = (value, [start, end]) => {
      return isWithinInterval(value, { start, end });
    };

    this.startOfYear = (value) => {
      return startOfYear(value);
    };

    this.startOfMonth = (value) => {
      return startOfMonth(value);
    };

    this.startOfWeek = (value) => {
      return startOfWeek(value, { locale: this.locale });
    };

    this.startOfDay = (value) => {
      return startOfDay(value);
    };

    this.endOfYear = (value) => {
      return endOfYear(value);
    };

    this.endOfMonth = (value) => {
      return endOfMonth(value);
    };

    this.endOfWeek = (value) => {
      return endOfWeek(value, { locale: this.locale });
    };

    this.endOfDay = (value) => {
      return endOfDay(value);
    };

    this.addYears = (value, amount) => {
      return addYears(value, amount);
    };

    this.addMonths = (value, amount) => {
      return addMonths(value, amount);
    };

    this.addWeeks = (value, amount) => {
      return addWeeks(value, amount);
    };

    this.addDays = (value, amount) => {
      return addDays(value, amount);
    };

    this.addHours = (value, amount) => {
      return addHours(value, amount);
    };

    this.addMinutes = (value, amount) => {
      return addMinutes(value, amount);
    };

    this.addSeconds = (value, amount) => {
      return addSeconds(value, amount);
    };

    this.getYear = (value) => {
      return getYear(value);
    };

    this.getMonth = (value) => {
      return getMonth(value);
    };

    this.getDate = (value) => {
      return getDate(value);
    };

    this.getHours = (value) => {
      return getHours(value);
    };

    this.getMinutes = (value) => {
      return getMinutes(value);
    };

    this.getSeconds = (value) => {
      return getSeconds(value);
    };

    this.getMilliseconds = (value) => {
      return getMilliseconds(value);
    };

    this.setYear = (value, year) => {
      return setYear(value, year);
    };

    this.setMonth = (value, month) => {
      return setMonth(value, month);
    };

    this.setDate = (value, date) => {
      return setDate(value, date);
    };

    this.setHours = (value, hours) => {
      return setHours(value, hours);
    };

    this.setMinutes = (value, minutes) => {
      return setMinutes(value, minutes);
    };

    this.setSeconds = (value, seconds) => {
      return setSeconds(value, seconds);
    };

    this.setMilliseconds = (value, milliseconds) => {
      return setMilliseconds(value, milliseconds);
    };

    this.getWeek = (value) => {
      return getWeek(value, { locale: this.locale });
    };

    this.getDaysInMonth = (value) => {
      return getDaysInMonth(value);
    };

    this.getNextMonth = (value) => {
      return addMonths(value, 1);
    };

    this.getPreviousMonth = (value) => {
      return addMonths(value, -1);
    };

    this.getWeekArray = (value) => {
      const start = startOfWeek(startOfMonth(value), {
        locale: this.locale,
      });
      const end = endOfWeek(endOfMonth(value), {
        locale: this.locale,
      });
      let current = start;
      const nestedWeeks = [];

      while (isBefore(current, end)) {
        const weekNumber = getWeek(current, { locale: this.locale });
        const week = Array.from({ length: 7 }).map((_, dayIndex) => {
          const day = addDays(current, dayIndex);
          if (getWeek(day, { locale: this.locale }) !== weekNumber) {
            return null;
          }
          return day;
        });

        nestedWeeks.push(week);
        current = addWeeks(current, 1);
      }

      return nestedWeeks;
    };

    this.getYearRange = (start, end) => {
      const startDate = startOfYear(start);
      const endDate = endOfYear(end);
      const years = [];
      let current = startDate;
      while (isBefore(current, endDate)) {
        years.push(current);
        current = addYears(current, 1);
      }
      return years;
    };
  }
}
