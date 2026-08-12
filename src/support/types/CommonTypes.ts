// -----------------------------------------------------------------------------
// CommonTypes - Core Type Definitions & Interfaces
//
// PURPOSE:
// - Houses shared type definitions, severity levels, link structures,
//   and XML result models used across FrameWright framework reporting and assertions.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// REPORTING & ALLURE TYPES
// -----------------------------------------------------------------------------

/**
 * Allure test severity level options.
 */
export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

/**
 * External reference link structure (e.g. Jira issue or TMS link).
 */
export type Link = {
  /** Unique ID or key for the external issue/link. */
  id: string;
  /** Direct URL link. */
  url?: string;
  /** Display label name. */
  name?: string;
  /** Link type category (e.g., 'issue', 'tms'). */
  type?: string;
};

// -----------------------------------------------------------------------------
// XML & SUITE RESULTS TYPES
// -----------------------------------------------------------------------------

/**
 * Parsed JUnit XML result attributes structure.
 */
export type ParsedXML = {
  /** Total number of tests. */
  tests: string;
  /** Total number of failures. */
  failures: string;
  /** Total number of skipped tests. */
  skipped: string;
  /** Total number of errors. */
  errors?: string;
  /** Total execution time. */
  time?: string;
  /** Test suite name. */
  name?: string;
  /** Additional dynamic attributes. */
  [key: string]: unknown;
};
