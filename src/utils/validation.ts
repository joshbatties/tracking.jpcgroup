import type { ValidationResult } from '../types/tracking';

const MAX_INPUT_LENGTH = 50;

export const PATTERNS = {
  CONTAINER: /^[A-Z]{4}\d{7}$/,
  BOOKING: /.+/,
  COMPANY: /^[A-Z]{9}$/
} as const;

type InputType = 'container' | 'booking' | 'company';

export const validateInput = (input: string, type: InputType): ValidationResult => {
  const value = input.trim().toUpperCase();
  
  if (!value) {
    return { isValid: false, error: 'Input is required' };
  }

  if (value.length > MAX_INPUT_LENGTH) {
    return { isValid: false, error: `Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters` };
  }

  let pattern: RegExp;
  let format: string;

  switch(type) {
    case 'container':
      pattern = PATTERNS.CONTAINER;
      format = "ABCD1234567";
      break;
    case 'booking':
      pattern = PATTERNS.BOOKING;
      format = "any";
      break;
    case 'company':
      pattern = PATTERNS.COMPANY;
      format = "ABCDEFGIJ";
      break;
  }

  if (!pattern.test(value)) {
    return { 
      isValid: false, 
      error: `Invalid format. Expected: ${format}` 
    };
  }

  return { isValid: true };
};

export const validateSearchQuery = (query: string): ValidationResult => {
  const value = query.trim().toUpperCase();

  if (!value) {
    return { isValid: false, error: 'Search query is required' };
  }

  if (value.length > MAX_INPUT_LENGTH) {
    return { isValid: false, error: `Query exceeds maximum length of ${MAX_INPUT_LENGTH} characters` };
  }

  const isValidContainer = PATTERNS.CONTAINER.test(value);
  const isValidBooking = PATTERNS.BOOKING.test(value);
  const isValidCompany = PATTERNS.COMPANY.test(value);

  if (!isValidContainer && !isValidBooking && !isValidCompany) {
    return { 
      isValid: false, 
      error: 'Invalid format' 
    };
  }

  return { isValid: true };
};