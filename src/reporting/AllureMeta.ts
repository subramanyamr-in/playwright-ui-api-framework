import type { Link, Severity } from '@models/CommonTypes.js';

/**
 * TestMetadataOptions - Structure for attaching rich Allure test metadata
 *
 * Defines the schema for test annotations such as Epic, Feature, Story,
 * Severity, Owner, Tags, Issues, TMS Links, and Descriptions.
 */
export type TestMetadataOptions = {
  // ===== Core hierarchy =====
  /** High-level epic name (e.g., 'User Authentication', 'Checkout') */
  epic?: string;
  /** Feature category under epic (e.g., 'Login', 'Payment Gateway') */
  feature?: string;
  /** User story or test scenario name(s) */
  story?: string | string[];
  /** Test severity level ('blocker', 'critical', 'normal', 'minor', 'trivial') */
  severity?: Severity;

  // ===== Ownership =====
  /** Test author, owner, or team ID */
  owner?: string;
  /** System component under test */
  component?: string;

  // ===== Classification =====
  /** Classification tags for filtering (e.g., ['smoke', 'regression']) */
  tags?: string[];

  // ===== External references =====
  /** Issue tracking tickets (e.g., Jira keys with optional URLs) */
  issues?: Link[];
  /** Test Management System references (e.g., TestRail ID with optional URL) */
  tmsLinks?: Link[];

  // ===== Optional =====
  /** Detailed description of test objective and preconditions */
  description?: string;
};
