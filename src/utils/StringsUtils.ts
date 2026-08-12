import CryptoJS from 'crypto-js';
import randomString from 'randomstring';
import format from 'string-format';

// -----------------------------------------------------------------------------
// StringsUtils - String Manipulation & Formatting Utility Class
//
// PURPOSE:
// - Provides static helper methods for string formatting, placeholder replacement,
//   case transformations (PascalCase, camelCase), random string generation,
//   AES encryption/decryption, array sorting, and URL query parsing.
// -----------------------------------------------------------------------------

const DEFAULT_SECRET_KEY = 'SECRET';

export class StringsUtils {
  // -----------------------------------------------------------------------------
  // STRING FORMATTING & REPLACEMENT
  // -----------------------------------------------------------------------------

  /**
   * Replaces positional placeholders `{0}`, `{1}`, etc., in a template string with given values.
   *
   * @param str - The template string to format.
   * @param replaceValue - Values to substitute into positional placeholders.
   * @returns Formatted string.
   */
  public static formatString(str: string, ...replaceValue: string[]): string {
    let result = str;
    for (let i = 0; i < replaceValue.length; i++) {
      result = result.split(`{${i}}`).join(replaceValue[i]);
    }
    return result;
  }

  /**
   * Replaces named placeholders `{key}` in a template string with values from an object.
   *
   * @param str - The template string to format.
   * @param replaceValue - Object mapping placeholder keys to replacement values.
   * @returns Formatted string.
   */
  public static formatStringValue(str: string, replaceValue: Record<string, any>): string {
    let result = str;
    for (const [key, value] of Object.entries(replaceValue)) {
      result = result.split(`{${key}}`).join(`${value}`);
    }
    return result;
  }

  /**
   * Formats a template string using `string-format` library for object substitution.
   *
   * @param str - Template string containing `{key}` placeholders.
   * @param obj - Object containing key-value pairs to populate the template.
   * @returns Formatted string.
   */
  public static formatStringFromObject(str: string, obj: any): string {
    return format(str, obj);
  }

  /**
   * Replaces all global occurrences of a substring within a target string.
   *
   * @param str - Original target string.
   * @param searchValue - Substring to find and replace.
   * @param replaceValue - Replacement text.
   * @returns String with all occurrences replaced.
   */
  public static replaceAll(str: string, searchValue: string, replaceValue: string): string {
    const replacer = new RegExp(searchValue, 'g');
    return str.replace(replacer, replaceValue);
  }

  /**
   * Replaces matches of a regular expression within a string.
   *
   * @param str - Source string to evaluate.
   * @param regex - Regular expression pattern to match.
   * @param value - Replacement value.
   * @returns Modified string.
   */
  public static getRegXLocator(str: string, regex: RegExp, value: string): string {
    return str.replace(regex, value);
  }

  // -----------------------------------------------------------------------------
  // CASE & NORMALIZATION CONVERSIONS
  // -----------------------------------------------------------------------------

  /**
   * Normalizes header by converting the first character of the string to lowercase.
   *
   * @param input - The input string to normalize.
   * @returns String with first character in lowercase, or empty string if input is falsy.
   */
  public static normalizeHeader(input: string): string {
    if (!input) return '';
    return input.charAt(0).toLowerCase() + input.slice(1);
  }

  /**
   * Converts a given string to PascalCase format.
   * Words delimited by space, hyphen, or underscore are capitalized.
   *
   * @param input - Input string to transform.
   * @returns PascalCase formatted string.
   */
  public static toPascalCase(input: string): string {
    return input
      .toLowerCase()
      .split(/[\s-_]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Converts a given string to camelCase format.
   * Words delimited by space, hyphen, or underscore are transformed.
   *
   * @param input - Input string to transform.
   * @returns camelCase formatted string.
   */
  public static toCamelCase(input: string): string {
    return input
      .toLowerCase()
      .split(/[\s-_]+/)
      .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
      .join('');
  }

  /**
   * Normalizes text by collapsing extra whitespace, carriage returns, and newlines into single spaces.
   *
   * @param text - Raw text to normalize.
   * @returns Cleaned single-line text string.
   */
  public static normalizeText(text: string): string {
    return text.replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  // -----------------------------------------------------------------------------
  // RANDOM STRING GENERATION
  // -----------------------------------------------------------------------------

  /**
   * Generates a random alphanumeric string of a specified length.
   *
   * @param length - Desired string length.
   * @returns Random alphanumeric string.
   */
  public static randomAlphanumericString(length: number): string {
    return randomString.generate(length);
  }

  /**
   * Generates a random alphabetic string of a specified length.
   *
   * @param length - Desired string length.
   * @returns Random alphabetic string.
   */
  public static randomAlphabeticString(length: number): string {
    return randomString.generate({
      length,
      charset: 'alphabetic',
    });
  }

  /**
   * Generates a random uppercase alphabetic string of a specified length.
   *
   * @param length - Desired string length.
   * @returns Random uppercase string.
   */
  public static randomUppercaseString(length: number): string {
    return randomString.generate({
      length,
      charset: 'alphabetic',
      capitalization: 'uppercase',
    });
  }

  /**
   * Generates a random lowercase alphabetic string of a specified length.
   *
   * @param length - Desired string length.
   * @returns Random lowercase string.
   */
  public static randomLowercaseString(length: number): string {
    return randomString.generate({
      length,
      charset: 'alphabetic',
      capitalization: 'lowercase',
    });
  }

  /**
   * Generates a random numeric string of a specified length.
   *
   * @param length - Desired string length.
   * @returns Random numeric string.
   */
  public static randomNumberString(length: number): string {
    return randomString.generate({ length, charset: 'numeric' });
  }

  // -----------------------------------------------------------------------------
  // ENCRYPTION & DECRYPTION
  // -----------------------------------------------------------------------------

  /**
   * Encrypts a plaintext string using AES encryption.
   *
   * @param password - Plaintext string to encrypt.
   * @param secretKey - Optional encryption key (defaults to standard secret key).
   * @returns AES encrypted ciphertext string.
   */
  public static cipherPassword(password: string, secretKey: string = DEFAULT_SECRET_KEY): string {
    return CryptoJS.AES.encrypt(password, secretKey).toString();
  }

  /**
   * Decrypts an AES encrypted ciphertext string back to UTF-8 plaintext.
   *
   * @param encryptedPassword - AES ciphertext string to decrypt.
   * @param secretKey - Optional secret key used during encryption.
   * @returns Decrypted plaintext string.
   */
  public static decipherPassword(
    encryptedPassword: string,
    secretKey: string = DEFAULT_SECRET_KEY
  ): string {
    return CryptoJS.AES.decrypt(encryptedPassword, secretKey).toString(CryptoJS.enc.Utf8);
  }

  // -----------------------------------------------------------------------------
  // ARRAY & LIST OPERATIONS
  // -----------------------------------------------------------------------------

  /**
   * Sorts a list of strings in ascending order using natural numeric comparison.
   *
   * @param list - Array of strings to sort.
   * @returns Sorted string array in ascending order.
   */
  public static sortListAsc(list: string[]): string[] {
    return list.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  }

  /**
   * Sorts a list of strings in descending order using natural numeric comparison.
   *
   * @param list - Array of strings to sort.
   * @returns Sorted string array in descending order.
   */
  public static sortListDesc(list: string[]): string[] {
    return list.sort((a, b) => b.localeCompare(a, 'en', { numeric: true }));
  }

  /**
   * Calculates the cumulative length of all strings in an array.
   *
   * @param values - Array of strings.
   * @returns Total character count across all strings in the array.
   */
  public static calculateTotalLength(values: string[]): number {
    return values.reduce((acc, value) => acc + value.length, 0);
  }

  // -----------------------------------------------------------------------------
  // REGEX & PARSING UTILITIES
  // -----------------------------------------------------------------------------

  /**
   * Extracts `@tag` annotations and clean test description from an input string.
   *
   * @param inputString - Input string containing optional `@tag` prefixes or inline tags.
   * @returns Object containing `tags` array (without `@`) and cleaned `testDescription`.
   */
  public static extractTagsAndTitle(inputString: string): {
    tags: string[];
    testDescription: string;
  } {
    const regex = /@([\w-]+)/g;
    const matches = inputString.match(regex);

    const tags = matches ? matches.map((match) => match.slice(1)) : [];
    const testDescription = inputString.replace(regex, '').trim();
    return { tags, testDescription };
  }

  /**
   * Extracts the numeric value of a specified query parameter from a URL string.
   *
   * @param url - Full or partial URL string containing query parameters.
   * @param key - Parameter name to extract.
   * @returns Extracted numeric string value if matched, or null if parameter is absent.
   */
  public static extractQueryParam(url: string, key: string): string | null {
    const matches = url.match(`[?&]${key}=(-?\\d+)`);
    return matches?.[1] ?? null;
  }

  // -----------------------------------------------------------------------------
  // ENUM UTILITIES
  // -----------------------------------------------------------------------------

  /**
   * Resolves the key name corresponding to a value in a TypeScript enum object.
   *
   * @param enumObj - TypeScript enum object.
   * @param value - Value to search for in the enum.
   * @returns Enum key string if found, or undefined if no match exists.
   */
  public static getEnumKeyByValue<T extends Record<string, string | number>>(
    enumObj: T,
    value: T[keyof T]
  ): string | undefined {
    return Object.keys(enumObj)
      .filter((keyName) => isNaN(Number(keyName)))
      .find((keyName) => enumObj[keyName as keyof T] === value);
  }
}
