const FOLDER_REPORTS = 'reports';

export const PathConstants = {
  // Directory & Folder Paths
  FOLDER_ARTIFACTS: 'artifacts',
  FOLDER_DOWNLOAD: `${FOLDER_REPORTS}/downloads`,
  FOLDER_REPORTS,
  FOLDER_REPORTS_BASE: `${FOLDER_REPORTS}/${new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19)}`,
  FOLDER_SCREENSHOTS: './screenshots/',
  FOLDER_TESTS: './tests',
  FOLDER_VIDEOS: './videos/',

  // Log Paths
  LOG_FOLDER_PATH: 'logFiles',

  // Report & Result Paths
  ALLURE_REPORTS_PATH: 'allure-results',
  BLOB_REPORTS_PATH: 'blob-report',
  HTML_REPORTS_PATH: 'html',
  JSON_REPORTS_PATH: 'results/results.json',
  JUNIT_REPORTS_PATH: 'results/results.xml',
  ORDERED_RESULTS_PATH: 'ordered-results',
  ORDERED_SUMMARY_HTML_PATH: 'ordered-summary.html',
  ORDERED_SUMMARY_JSON_PATH: 'ordered-summary.json',
  STORAGE_STATE_PATH: 'auth/storageState.json',
} as const;
