export const SetupConstants = {
  // Timeouts (in milliseconds)
  BIG_TIMEOUT: 30 * 1000,
  MAX_TIMEOUT: 60 * 1000,
  SMALL_TIMEOUT: 5 * 1000,
  STANDARD_TIMEOUT: 10 * 1000,
  TEST_TIMEOUT: 10 * 60 * 1000,

  // Duration labels
  HOUR: 'hour',
  MINUTE: 'minute',
  SECOND: 'second',

  // Log Levels & Formatting
  DEBUG: 'debug',
  ERROR: 'error',
  INFO: 'info',
  LOGGER_LINE_SEPARATOR:
    '-----------------------------------------------------------------------------------------------',
  TRACE: 'trace',
  WARN: 'warn',

  // Report & Framework Info
  FRAMEWORK_TITLE: 'FrameWright UI Automation',
  HTML_REPORT_TITLE: 'Test Automation Report',

  // Playwright & Environment Setup
  ALL: 'all',
  ALWAYS: 'always',
  ATTACHED_STATE: 'attached',
  CHROMIUM: 'chromium',
  LOAD_STATE_NETWORKIDLE: 'networkidle',
  LOCAL: 'local',
  NEVER: 'never',
  NONE: 'none',
  ONLY_ON_FAILURE: 'only-on-failure',
  PASSED_STATUS: 'passed',
  RETAIN_ON_FAILURE: 'retain-on-failure',
  VISIBLE_STATE: 'visible',
} as const;
