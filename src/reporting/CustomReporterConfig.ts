import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestError,
  TestResult,
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
import type { ParsedXML } from '@models/CommonTypes.js';
import { PathConstants } from '@constants/PathConstants.js';
import { SetupConstants } from '@constants/SetupConstants.js';
import { TestResultStatus } from '@enums/TestResultStatus.js';
import { FileUtils } from '@utils/FileUtils.js';
import { Logger } from '@logger/Logger.js';
import { GenerateReports } from './GenerateReports.js';

let totalTests = 0;
let currentTest = 1;

let suiteStartTime: string, suiteEndTime: string;
const getFormattedTime = () => `${new Date().toISOString()}`;
const ciPerspective = process.env.CI === 'true';

const getDuration = (startTime: string, endTime: string) => {
  // Convert start and end time strings to Date objects and get timestamps in seconds
  const firstDateInSeconds = new Date(startTime).getTime() / 1000;
  const secondDateInSeconds = new Date(endTime).getTime() / 1000;

  // Calculate difference in seconds
  const differenceInSeconds = roundSeconds(firstDateInSeconds - secondDateInSeconds);

  // Less than 60 seconds
  if (differenceInSeconds < 60) {
    return formatDuration(differenceInSeconds, SetupConstants.SECOND || 'second');
  }
  // Less than 1 hour
  else if (differenceInSeconds < 3600) {
    const minutes = Math.floor(differenceInSeconds / 60);
    const seconds = differenceInSeconds % 60;
    return (
      formatDuration(minutes, SetupConstants.MINUTE || 'minute') +
      ' ' +
      formatDuration(seconds, SetupConstants.SECOND || 'second')
    );
  }
  // Hours, minutes, seconds
  else {
    const hours = Math.floor(differenceInSeconds / 3600);
    const remainingSeconds = differenceInSeconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return (
      formatDuration(hours, SetupConstants.HOUR || 'hour') +
      ' ' +
      formatDuration(minutes, SetupConstants.MINUTE || 'minute') +
      ' ' +
      formatDuration(seconds, SetupConstants.SECOND || 'second')
    );
  }
};

// Helper function to format duration with proper pluralization
const formatDuration = (value: number, unit: string) => {
  return `${value} ${value !== 1 ? unit + 's' : unit}`;
};

// Helper function to round seconds to nearest integer
const roundSeconds = (seconds: number) => Math.round(seconds);

/**
 * CustomReporterConfig - Custom Playwright test execution reporter
 *
 * Provides real-time console progress logging, test timing metrics,
 * result summaries, and post-execution cleanup of old reports and log files.
 */
export default class CustomReporterConfig implements Reporter {
  private rootSuite?: Suite;

  onBegin(_config: FullConfig, suite: Suite): void {
    this.rootSuite = suite;
    suiteStartTime = getFormattedTime();
    totalTests = suite.allTests().length;
    Logger.consoleOnly(`Starting test suite execution with ${totalTests} tests`);
  }

  onEnd(result: FullResult): void | Promise<void> {
    suiteEndTime = getFormattedTime();
    Logger.consoleOnly(`Final execution status: ${result.status}`);
    Logger.consoleOnly(`Overall run duration: ${getDuration(suiteEndTime, suiteStartTime)}`);
  }

  onTestBegin(test: TestCase): void {
    Logger.consoleOnly(`Test ${currentTest} of ${totalTests} - ${test.parent.title}`);
    Logger.consoleOnly(`Test Case Started: ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    let errorMessage: string | undefined = undefined;
    if (result.status === TestResultStatus.PASSED) {
      Logger.consoleOnly(`Test Case ${result.status}: ${test.title}`);
    } else if (result.status === TestResultStatus.SKIPPED) {
      Logger.consoleOnly(`Test Case ${result.status}: ${test.title}`);
    } else if (result.status === TestResultStatus.FAILED && result.error) {
      errorMessage = result.error.message?.toString();
      Logger.error(`Test Case Failed: ${test.title}\n Error: ${errorMessage}`);
    }

    const execTimeInSeconds = result.duration / 1000;
    const data = {
      date: getFormattedTime(),
      test: test.title,
      status: result.status,
      executionTime: `${execTimeInSeconds} ${SetupConstants.SECOND || 'seconds'}`,
      ...(errorMessage && { errors: errorMessage }),
    };

    const dataToString = JSON.stringify(data, null, 2);
    Logger.consoleOnly(`Test Execution Completed: ${dataToString}`);

    const ciRetries = process.env.CI_RETRIES ? +process.env.CI_RETRIES : 1;
    if (
      ciPerspective &&
      (result.status === SetupConstants.PASSED_STATUS.toLowerCase() || result.retry === ciRetries)
    ) {
      currentTest++;
    }
    if (!ciPerspective) {
      currentTest++;
    }
  }

  onError(error: TestError): void {
    Logger.error(`Runner Error: ${error.message}`);
  }

  async onExit(): Promise<void> {
    try {
      let totalTestsCount = 0;
      let passedTestsCount = 0;
      let failedTestsCount = 0;
      let flakyTestsCount = 0;
      let skippedTestsCount = 0;

      if (this.rootSuite) {
        const allTests = this.rootSuite.allTests();
        totalTestsCount = allTests.length;
        passedTestsCount = allTests.filter((t) => t.outcome() === 'expected').length;
        failedTestsCount = allTests.filter((t) => t.outcome() === 'unexpected').length;
        flakyTestsCount = allTests.filter((t) => t.outcome() === 'flaky').length;
        skippedTestsCount = allTests.filter((t) => t.outcome() === 'skipped').length;
      } else {
        const xmlResult = await parseLatestXML();
        if (xmlResult) {
          totalTestsCount = parseInt(xmlResult.tests || '0', 10);
          failedTestsCount = parseInt(xmlResult.failures || '0', 10);
          skippedTestsCount = parseInt(xmlResult.skipped || '0', 10);
          passedTestsCount = totalTestsCount - failedTestsCount - skippedTestsCount;
        }
      }

      Logger.consoleOnly('----------------------------------------');
      Logger.consoleOnly('Test Execution Result Summary');
      Logger.consoleOnly('Total Testcases:'.padEnd(20) + totalTestsCount);
      Logger.consoleOnly('Passed:'.padEnd(20) + passedTestsCount);
      Logger.consoleOnly('Failed:'.padEnd(20) + failedTestsCount);
      Logger.consoleOnly('Flaky:'.padEnd(20) + flakyTestsCount);
      Logger.consoleOnly('Skipped:'.padEnd(20) + skippedTestsCount);
      Logger.consoleOnly('----------------------------------------');
    } catch (error) {
      Logger.warn(`Could not parse test execution summary: ${error}`);
    }

    await clearReports(5);
    await clearLogs(5);
  }
}

/**
 * Method to read and parse the latest JUnit XML report
 *
 * @returns Parsed XML test suite metadata
 */
async function parseLatestXML(): Promise<ParsedXML> {
  const filePath = path.join(GenerateReports.getLatestRunFolder(), './results/results.xml');
  if (!fs.existsSync(filePath)) {
    throw new Error(`XML report file not found at ${filePath}`);
  }
  const xmlString = FileUtils.getFileContent(filePath, 'utf-8');
  const result = await xml2js.parseStringPromise(xmlString);
  return result.testsuites.$;
}

/**
 * Deletes old report folders, keeping only the most recent ones up to the specified limit.
 *
 * @param max - Maximum number of report folders to retain
 */
async function clearReports(max: number): Promise<void> {
  const reportsDir = PathConstants.FOLDER_REPORTS;
  if (!fs.existsSync(reportsDir)) return;

  const folderNameRegex = /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/;

  const folders = fs
    .readdirSync(reportsDir)
    .filter((name) => {
      const fullPath = path.join(reportsDir, name);
      return fs.statSync(fullPath).isDirectory() && folderNameRegex.test(name);
    })
    .sort((a, b) => {
      return new Date(a.replace('_', 'T')).getTime() - new Date(b.replace('_', 'T')).getTime();
    });

  const foldersToDelete = folders.length > max ? folders.slice(0, folders.length - max) : [];

  foldersToDelete.forEach((folder) => {
    const fullPath = path.join(reportsDir, folder);
    fs.rmSync(fullPath, { recursive: true, force: true });
    Logger.consoleOnly(`Deleted Report: ${folder}`);
  });
}

/**
 * Deletes old log files, grouping them by timestamp and keeping only the most recent entries.
 *
 * @param max - Maximum number of unique timestamp log runs to retain
 */
async function clearLogs(max: number): Promise<void> {
  const logsDir = PathConstants.LOG_FOLDER_PATH;
  if (!fs.existsSync(logsDir)) return;

  const logNameRegex = /^log_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})_worker-\d+\.log$/;
  const logFiles = fs
    .readdirSync(logsDir)
    .filter((file) => logNameRegex.test(file))
    .sort((a, b) => {
      const matchA = a.match(logNameRegex);
      const matchB = b.match(logNameRegex);
      const dateA = matchA?.[1] ? matchA[1].replace('_', 'T') : '';
      const dateB = matchB?.[1] ? matchB[1].replace('_', 'T') : '';

      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });

  const uniqueDates = Array.from(
    new Set(
      logFiles.map((file) => file.match(logNameRegex)?.[1]).filter((d): d is string => Boolean(d))
    )
  );

  const datesToDelete =
    uniqueDates.length > max ? uniqueDates.slice(0, uniqueDates.length - max) : [];

  const filesToDelete = logFiles.filter((file) =>
    datesToDelete.some((date) => file.includes(date))
  );

  filesToDelete.forEach((file) => {
    const fullPath = path.join(logsDir, file);
    fs.rmSync(fullPath, { force: true });
    Logger.consoleOnly(`Deleted Logs: ${file}`);
  });
}
