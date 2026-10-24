import { ValidateBy, ValidationOptions } from 'class-validator';
import { isValidIsoDate, MONTH_REGEX } from './dates';

/** YYYY-MM-DD that is a real calendar date. */
export function IsCalendarDate(options?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isCalendarDate',
      validator: {
        validate: (value) => typeof value === 'string' && isValidIsoDate(value),
        defaultMessage: (args) => `${args?.property} must be a valid date in YYYY-MM-DD format`,
      },
    },
    options,
  );
}

/** YYYY-MM month. */
export function IsMonth(options?: ValidationOptions) {
  return ValidateBy(
    {
      name: 'isMonth',
      validator: {
        validate: (value) => typeof value === 'string' && MONTH_REGEX.test(value),
        defaultMessage: (args) => `${args?.property} must be a month in YYYY-MM format`,
      },
    },
    options,
  );
}
