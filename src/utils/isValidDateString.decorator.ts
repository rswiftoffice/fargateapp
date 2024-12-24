import { ValidationOptions, Matches } from 'class-validator';

export const isoDateStringRegex =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/;

export function IsValidDateString(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return Matches(isoDateStringRegex, {
    message: ({ property }) =>
      `${property} must be a valid ISO 8061 format date string`,
    ...validationOptions,
  });
}
