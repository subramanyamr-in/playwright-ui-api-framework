import { expect, type APIResponse, type Locator, type Page } from '@playwright/test';
import { Logger } from '@logger/Logger.js';
import { StepRunner } from '@reporting/StepRunner.js';

// -----------------------------------------------------------------------------
// AssertUtils - Assertion Helper Utility Class
//
// PURPOSE:
// - Standardizes generic data, numeric, string, array, DOM Locator, Page, and API assertions.
// - Integrates Allure step reporting via StepRunner and logger output.
// - Supports both hard assertions (throwing on failure) and soft assertions.
// - Exposes static utility methods and an instantiated `assertUtils` export.
// -----------------------------------------------------------------------------

export class AssertUtils {
  private static getExpect(softAssert = false) {
    return softAssert ? expect.soft : expect;
  }

  // -----------------------------------------------------------------------------
  // BOOLEAN ASSERTIONS
  // -----------------------------------------------------------------------------

  /**
   * Asserts that the supplied condition evaluates to true.
   *
   * @param condition - The boolean condition to evaluate.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertTrue(
    condition: boolean,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      AssertUtils.getExpect(softAssert)(
        condition,
        `${description} | Expected: true, Actual: ${condition}`
      ).toBeTruthy();
    });
  }

  /**
   * Asserts that the supplied condition evaluates to false.
   *
   * @param condition - The boolean condition to evaluate.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertFalse(
    condition: boolean,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      AssertUtils.getExpect(softAssert)(
        condition,
        `${description} | Expected: false, Actual: ${condition}`
      ).toBeFalsy();
    });
  }

  // -----------------------------------------------------------------------------
  // EQUALITY & VALUE COMPARISON ASSERTIONS
  // -----------------------------------------------------------------------------

  /**
   * Asserts that two values are equal.
   *
   * @param actual - The actual value obtained.
   * @param expected - The expected value to compare against.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertEquals(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      AssertUtils.getExpect(softAssert)(
        actual,
        `${description} | Expected: "${expected}", Actual: "${actual}"`
      ).toEqual(expected);
    });
  }

  /**
   * Asserts that two values are not equal.
   *
   * @param actual - The actual value obtained.
   * @param expected - The expected value that actual should not equal.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertNotEquals(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      AssertUtils.getExpect(softAssert)(
        actual,
        `${description} | Expected NOT equal to "${expected}", Actual: "${actual}"`
      ).not.toEqual(expected);
    });
  }

  // -----------------------------------------------------------------------------
  // STRING MATCHING ASSERTIONS
  // -----------------------------------------------------------------------------

  /**
   * Asserts that the target string contains the specified substring.
   *
   * @param value1 - The target string to search within.
   * @param value2 - The substring expected to be contained within value1.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertContains(
    value1: string,
    value2: string,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      AssertUtils.getExpect(softAssert)(
        value1,
        `${description} | "${value1}" should contain "${value2}"`
      ).toContain(value2);
    });
  }

  /**
   * Asserts that the supplied string starts with the given prefix.
   *
   * @param value - The input string to check.
   * @param prefix - The expected prefix string.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertStartsWith(
    value: string,
    prefix: string,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      const startsWithPrefix = value.startsWith(prefix);
      AssertUtils.getExpect(softAssert)(
        startsWithPrefix,
        `${description} | Expected "${value}" to start with "${prefix}"`
      ).toBeTruthy();
    });
  }

  /**
   * Asserts that the supplied string ends with the given suffix.
   *
   * @param value - The input string to check.
   * @param suffix - The expected suffix string.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertEndsWith(
    value: string,
    suffix: string,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        const endsWithSuffix = value.endsWith(suffix);
        expect(
          endsWithSuffix,
          `${description} | Expected "${value}" to end with "${suffix}"`
        ).toBeTruthy();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the supplied string matches the provided regular expression pattern.
   *
   * @param value - The input string to test.
   * @param pattern - The regular expression pattern to match against.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertMatchesRegex(
    value: string,
    pattern: RegExp,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(value, `${description} | Expected "${value}" to match pattern ${pattern}`).toMatch(
          pattern
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  // -----------------------------------------------------------------------------
  // ARRAY & LENGTH ASSERTIONS
  // -----------------------------------------------------------------------------

  /**
   * Asserts that the supplied array or string has the expected length.
   *
   * @param value - Array or string to check length for.
   * @param expectedLength - Expected length.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertLength(
    value: any[] | string,
    expectedLength: number,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(value, `${description} | Expected length ${expectedLength}`).toHaveLength(
          expectedLength
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the supplied array contains the expected item.
   *
   * @param expectedValues - The array to inspect.
   * @param actual - The item expected to be present in the array.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertArrayContains<T>(
    expectedValues: T[],
    actual: T,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(expectedValues, `${description} | "${actual}" should be present`).toContain(actual);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the supplied array does not contain the specified item.
   *
   * @param expectedValues - The array to inspect.
   * @param actual - The item expected NOT to be present in the array.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertArrayNotContains<T>(
    expectedValues: T[],
    actual: T,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(expectedValues, `${description} | "${actual}" should NOT be present`).not.toContain(
          actual
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  // -----------------------------------------------------------------------------
  // NULL, UNDEFINED & EMPTY ASSERTIONS
  // -----------------------------------------------------------------------------

  /**
   * Asserts that the supplied value is null.
   *
   * @param value - The value to check for nullness.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertNull(
    value: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(value, `${description} | Expected: null, Actual: ${value}`).toEqual(null);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the supplied value is not null.
   *
   * @param value - The value to check.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertNotNull(
    value: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(value, `${description} | Expected: NOT null, Actual: ${value}`).not.toEqual(null);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the supplied value is undefined.
   *
   * @param value - The value to check for undefined state.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertUndefined(
    value: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(value, `${description} | Expected: undefined, Actual: ${value}`).toBeUndefined();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the supplied value is defined (not undefined).
   *
   * @param value - The value to verify as defined.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertDefined(
    value: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(value, `${description} | Expected: defined, Actual: ${value}`).toBeDefined();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the supplied value is not NaN.
   *
   * @param value - The value to check for NaN.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertNotNaN(
    value: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        const isNaNValue = Number.isNaN(value);
        expect(isNaNValue, `${description} | Expected: NOT NaN, Actual: ${value}`).toBe(false);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the supplied string, array, or locator is empty.
   *
   * @param value - The element or object to check for emptiness.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertEmpty(
    value: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        if (typeof value === 'string' || Array.isArray(value)) {
          expect(value, `${description} | Expected to be empty`).toHaveLength(0);
        } else {
          await expect(value, `${description} | Expected to be empty`).toBeEmpty();
        }
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  // -----------------------------------------------------------------------------
  // NUMERIC & RANGE ASSERTIONS
  // -----------------------------------------------------------------------------

  /**
   * Asserts that the actual numeric value is greater than the expected threshold.
   *
   * @param actual - The actual numeric value.
   * @param expected - The minimum non-inclusive threshold.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertGreaterThan(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(actual, `${description} | Expected ${actual} > ${expected}`).toBeGreaterThan(
          expected
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the actual numeric value is greater than or equal to the expected threshold.
   *
   * @param actual - The actual numeric value.
   * @param expected - The minimum inclusive threshold.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertGreaterThanOrEqual(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(actual, `${description} | Expected ${actual} >= ${expected}`).toBeGreaterThanOrEqual(
          expected
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the actual numeric value is less than the expected threshold.
   *
   * @param actual - The actual numeric value.
   * @param expected - The maximum non-inclusive threshold.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertLessThan(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(actual, `${description} | Expected ${actual} < ${expected}`).toBeLessThan(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the actual numeric value is less than or equal to the expected threshold.
   *
   * @param actual - The actual numeric value.
   * @param expected - The maximum inclusive threshold.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertLessThanOrEqual(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(actual, `${description} | Expected ${actual} <= ${expected}`).toBeLessThanOrEqual(
          expected
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that a given numeric value falls within an inclusive range [min, max].
   *
   * @param value - The value to evaluate.
   * @param min - The minimum inclusive limit.
   * @param max - The maximum inclusive limit.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertBetween(
    value: number,
    min: number,
    max: number,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        const isBetween = value >= min && value <= max;
        expect(
          isBetween,
          `${description} | Expected ${value} to be between ${min} and ${max}`
        ).toBeTruthy();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that a numeric value is close to an expected value within precision digits.
   *
   * @param actual - Actual numeric value.
   * @param expected - Expected numeric value.
   * @param numDigits - Precision digits to match.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertCloseTo(
    actual: number,
    expected: number,
    numDigits = 2,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(actual, `${description} | Expected ${actual} close to ${expected}`).toBeCloseTo(
          expected,
          numDigits
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  // -----------------------------------------------------------------------------
  // ELEMENT & DOM ASSERTIONS
  // -----------------------------------------------------------------------------

  /**
   * Asserts that a Playwright locator is visible.
   *
   * @param actual - Playwright Locator to inspect.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertVisible(
    actual: Locator,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(actual, `${description} | Expected element to be visible`).toBeVisible();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that a Playwright locator is enabled.
   *
   * @param actual - Playwright Locator to inspect.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertEnabled(
    actual: Locator,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(actual, `${description} | Expected element to be enabled`).toBeEnabled();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that a Playwright locator has exact text.
   *
   * @param actual - Playwright Locator to inspect.
   * @param expected - String or RegExp text expected.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertHasText(
    actual: Locator,
    expected: string | RegExp,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(actual, `${description} | Expected text "${expected}"`).toHaveText(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that a Playwright locator contains text.
   *
   * @param actual - Playwright Locator to inspect.
   * @param expected - Substring or RegExp expected inside locator.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertContainsText(
    actual: Locator,
    expected: string | RegExp,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(
          actual,
          `${description} | Expected to contain text "${expected}"`
        ).toContainText(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that a Playwright locator has the specified CSS class.
   *
   * @param actual - Playwright Locator or element to inspect.
   * @param expected - Class name string or RegExp pattern.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertHasClass(
    actual: any,
    expected: any,
    description: string,
    softAssert = false
  ): Promise<void> {
    const regexClassName = expected instanceof RegExp ? expected : new RegExp(expected);
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(actual, `${description} | Expected class "${expected}"`).toHaveClass(
          regexClassName
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that a Playwright locator has the specified ID attribute.
   *
   * @param actual - Playwright Locator to inspect.
   * @param expected - Expected ID attribute string.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertHasId(
    actual: Locator,
    expected: string,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(actual, `${description} | Expected ID "${expected}"`).toHaveAttribute(
          'id',
          expected
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that a Playwright locator has an attribute with a specified value.
   *
   * @param actual - Playwright Locator to inspect.
   * @param name - Attribute name.
   * @param value - Expected attribute value.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertHasAttribute(
    actual: Locator,
    name: string,
    value: string,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(
          actual,
          `${description} | Expected attribute ${name}="${value}"`
        ).toHaveAttribute(name, value);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that an input element locator has a specified value.
   *
   * @param actual - Playwright Locator for the input element.
   * @param expected - Expected input value string.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertHasValue(
    actual: Locator,
    expected: string,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(actual, `${description} | Expected value "${expected}"`).toHaveValue(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that a locator matches an expected count of elements.
   *
   * @param actual - Playwright Locator to inspect.
   * @param count - Expected matching element count.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertCount(
    actual: Locator,
    count: number,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(actual, `${description} | Expected count ${count}`).toHaveCount(count);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that the Playwright Page title matches expected text/pattern.
   *
   * @param page - Playwright Page object.
   * @param expected - String or RegExp matching page title.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertPageTitle(
    page: Page,
    expected: string | RegExp,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        await expect(page, `${description} | Expected page title "${expected}"`).toHaveTitle(
          expected
        );
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  // -----------------------------------------------------------------------------
  // API RESPONSE ASSERTIONS
  // -----------------------------------------------------------------------------

  /**
   * Asserts that an APIResponse status is in 200–299 range.
   *
   * @param response - Playwright APIResponse object.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertResponseOK(
    response: APIResponse,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(response.ok(), `${description} | Expected response status OK`).toBeTruthy();
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Asserts that an APIResponse status matches the expected HTTP status code.
   *
   * @param response - Playwright APIResponse object.
   * @param status - Expected HTTP status code (e.g. 200).
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   */
  public static async assertResponseStatus(
    response: APIResponse,
    status: number,
    description: string,
    softAssert = false
  ): Promise<void> {
    return StepRunner.run(`Assert: ${description}`, async () => {
      Logger.step(`Verifying: ${description}`);
      try {
        expect(
          response.status(),
          `${description} | Expected status ${status}, Actual: ${response.status()}`
        ).toBe(status);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  // -----------------------------------------------------------------------------
  // POLLING & RETRY ASSERTIONS
  // -----------------------------------------------------------------------------

  /**
   * Polls an assertion callback function until it returns the expected value.
   *
   * @param fn - Polled function returning value or Promise of value.
   * @param expected - Target value expected.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   * @param options - Optional timeout and polling intervals settings.
   */
  public static async assertPoll<T>(
    fn: () => T | Promise<T>,
    expected: T,
    description: string,
    softAssert = false,
    options?: { timeout?: number; intervals?: number[] }
  ): Promise<void> {
    return StepRunner.run(`Assert Poll: ${description}`, async () => {
      Logger.step(`Polling: ${description}`);
      try {
        await expect.poll(fn, options).toEqual(expected);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }

  /**
   * Retries an assertion block until it succeeds without throwing.
   *
   * @param fn - Callback function containing assertions to retry.
   * @param description - Human-readable description for step logging.
   * @param softAssert - If true, soft assertion is performed without immediate failure.
   * @param options - Optional timeout and polling intervals settings.
   */
  public static async assertToPass(
    fn: () => void | Promise<void>,
    description: string,
    softAssert = false,
    options?: { timeout?: number; intervals?: number[] }
  ): Promise<void> {
    return StepRunner.run(`Assert ToPass: ${description}`, async () => {
      Logger.step(`Retrying block: ${description}`);
      try {
        await expect(fn).toPass(options);
      } catch (error) {
        if (!softAssert) {
          throw error;
        }
      }
    });
  }
}

/**
 * Singleton instance export of AssertUtils for object-based invocation.
 */
export const assertUtils = AssertUtils;
