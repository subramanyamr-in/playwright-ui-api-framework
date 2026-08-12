import { exec, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Logger } from '@logger/Logger.js';

/**
 * GenerateReports - Utility class for launching and generating test execution reports
 *
 * Provides static helper procedures for opening Playwright HTML reports,
 * Priority/Ordered execution summaries, Flaky test reports, and Allure HTML report bundles.
 */
export class GenerateReports {
  private static readonly REPORT_ROOT = path.resolve(process.cwd(), 'reports');
  private static readonly FLAKY_REPORT_ROOT = path.resolve(process.cwd(), 'flaky-report');

  /**
   * Platform-independent helper to open a target file using system default application
   */
  private static openFile(filePath: string): void {
    const normalizedPath = path.resolve(filePath);
    let command = '';

    if (process.platform === 'darwin') {
      command = `open "${normalizedPath}"`;
    } else if (process.platform === 'win32') {
      command = `start "" "${normalizedPath}"`;
    } else {
      command = `xdg-open "${normalizedPath}"`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        Logger.error(`Failed to open file: ${error.message}`);
        return;
      }
      if (stderr) {
        Logger.error(stderr);
        return;
      }
      Logger.info(stdout);
    });
  }

  /**
   * Resolves environment variables ensuring JAVA_HOME is configured for Allure CLI tool
   */
  private static getCommandEnv(): NodeJS.ProcessEnv {
    const env = { ...process.env };
    const configuredJavaHome = env.JAVA_HOME;

    if (configuredJavaHome && fs.existsSync(configuredJavaHome)) {
      return env;
    }

    try {
      const resolvedJavaHome = execSync('/usr/libexec/java_home', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();

      if (resolvedJavaHome) {
        env.JAVA_HOME = resolvedJavaHome;
      }
    } catch {
      delete env.JAVA_HOME;
    }

    return env;
  }

  /**
   * Finds the most recent timestamped run folder under /reports containing allure-results
   *
   * @returns Path string to latest test run folder
   */
  public static getLatestRunFolder(): string {
    const root = this.REPORT_ROOT;

    if (!fs.existsSync(root)) {
      const message = `Report root directory not found at ${root}. Please run tests first.`;
      Logger.error(message);
      throw new Error(message);
    }

    const folders = fs
      .readdirSync(root)
      .filter((name) => /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/.test(name))
      .map((name) => path.join(root, name))
      .filter((dir) => fs.existsSync(path.join(dir, 'allure-results')));

    if (!folders.length) {
      const message = `
No test run folders found in ${root}.
Please run tests first: npm test
  `.trim();
      Logger.error(message);
      throw new Error(message);
    }

    folders.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    return folders[0]!;
  }

  /**
   * Opens the Playwright HTML report for the latest run folder
   */
  public static openHtmlReport(): void {
    const runPath = this.getLatestRunFolder();
    const htmlPath = path.join(runPath, 'html');

    if (!fs.existsSync(htmlPath)) {
      throw new Error(`HTML report not found at ${htmlPath}`);
    }

    const command = `npx playwright show-report "${htmlPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        Logger.error(`Failed to open HTML report: ${error.message}`);
        return;
      }
      if (stderr) {
        Logger.error(stderr);
        return;
      }
      Logger.info(stdout);
    });
  }

  /**
   * Opens the ordered execution summary HTML report for the latest run
   */
  public static openPriorityReport(): void {
    const runPath = this.getLatestRunFolder();
    const priorityReportPath = path.join(runPath, 'ordered-summary.html');

    if (!fs.existsSync(priorityReportPath)) {
      throw new Error(`Priority report not found at ${priorityReportPath}`);
    }

    this.openFile(priorityReportPath);
  }

  /**
   * Opens the latest flaky test HTML report snapshot
   */
  public static openFlakyReport(): void {
    const root = this.FLAKY_REPORT_ROOT;

    if (!fs.existsSync(root)) {
      throw new Error(`Flaky report folder not found at ${root}`);
    }

    const snapshotFolders = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, entry.name))
      .filter((dir) => fs.existsSync(path.join(dir, 'flaky-report.html')))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

    const snapshotFolder = snapshotFolders[0];
    const reportPath = snapshotFolder
      ? path.join(snapshotFolder, 'flaky-report.html')
      : path.join(root, 'flaky-report.html');

    if (!fs.existsSync(reportPath)) {
      throw new Error(`Flaky report not found at ${reportPath}`);
    }

    this.openFile(reportPath);
  }

  /**
   * Generates Allure HTML report bundle for the latest test run folder
   *
   * @param open - If true, automatically opens the generated Allure report in browser
   */
  public static generateAllureReport(open = false): void {
    const runPath = this.getLatestRunFolder();
    const resultsPath = path.join(runPath, 'allure-results');
    const reportPath = path.join(runPath, 'allure-report');
    const title = process.env.REPORT_TITLE || 'Automation Report';

    if (!fs.existsSync(resultsPath)) {
      throw new Error(`Allure results not found at ${resultsPath}`);
    }

    let command = `npx allure generate "${resultsPath}" --name "${title}" -o "${reportPath}" --clean`;

    if (open) {
      command += ` && npx allure open "${reportPath}"`;
    }

    exec(command, { env: this.getCommandEnv() }, (error, stdout, stderr) => {
      if (error) {
        Logger.error(`Allure generation failed: ${error.message}`);
        return;
      }
      if (stderr) {
        Logger.error(stderr);
        return;
      }
      Logger.info(stdout);
    });
  }
}

// CLI entry point
if (
  process.argv[1]?.endsWith('GenerateReports.ts') ||
  process.argv[1]?.endsWith('GenerateReports.js')
) {
  const mode = process.argv[2];

  if (mode === 'html') {
    GenerateReports.openHtmlReport();
  } else if (mode === 'priority') {
    GenerateReports.openPriorityReport();
  } else if (mode === 'flaky') {
    GenerateReports.openFlakyReport();
  } else if (mode === 'allure') {
    const open = process.argv.includes('--open');
    GenerateReports.generateAllureReport(open);
  } else {
    Logger.info(`
Usage:
  npx ts-node src/reporting/GenerateReports.ts html
  npx ts-node src/reporting/GenerateReports.ts priority
  npx ts-node src/reporting/GenerateReports.ts flaky
  npx ts-node src/reporting/GenerateReports.ts allure [--open]
`);
  }
}
