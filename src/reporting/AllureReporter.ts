import { test } from '@playwright/test';
import * as allure from 'allure-js-commons';
import * as fs from 'fs';
import { PlaywrightConfigHelper } from '@config/PlaywrightConfigHelper.js';
import { Logger } from '@logger/Logger.js';
import type { TestMetadataOptions } from './AllureMeta.js';

const EXPLICIT_DESCRIPTION_SET = Symbol('explicitAllureDescriptionSet');

type AllureTestInfo = ReturnType<typeof test.info> & {
  [EXPLICIT_DESCRIPTION_SET]?: boolean;
};

/**
 * AllureReporter - Utility facade providing methods to attach metadata, files,
 * steps, logs, and diagnostic attachments to Allure reports.
 *
 * ENHANCEMENTS:
 * - Auto-attach screenshots and video recordings on test failure
 * - Support for rich attachments (JSON, HTML, CSV, Text)
 * - Custom step wrapping with diagnostic logging
 * - Structured test metadata attachment (Epic, Feature, Story, Severity, Owner, Issues, TMS)
 */
export class AllureReporter {
  /**
   * Attach test metadata (Epic, Feature, Story, Severity, Owner, Tags, Issues, TMS)
   *
   * @param meta - Metadata configuration options
   *
   * @example
   * ```typescript
   * await AllureReporter.attachDetails({
   *   epic: 'Authentication',
   *   feature: 'User Login',
   *   story: 'Login with valid credentials',
   *   severity: 'critical',
   *   owner: 'QA Team',
   *   tags: ['smoke', 'login'],
   *   issues: [{ id: 'JIRA-123', url: 'https://jira.company.com/browse/JIRA-123' }],
   *   tmsLinks: [{ id: 'TC-001', url: 'https://testrail.company.com/cases/001' }]
   * });
   * ```
   */
  static async attachDetails(meta: TestMetadataOptions): Promise<void> {
    const testInfo = test.info();

    const addAnnotation = (type: string, value: string) => {
      const exists = testInfo.annotations.some((a) => a.type === type && a.description === value);

      if (!exists) {
        testInfo.annotations.push({ type, description: value });
      }
    };

    const handleSingle = async (
      value: string | undefined,
      allureFn: ((v: string) => PromiseLike<void>) | null,
      type: string
    ) => {
      if (!value) return;

      if (allureFn) {
        await allureFn(value);
      }

      addAnnotation(type, value);
    };

    const handleMultiple = async (
      values: string[] | undefined,
      allureFn: ((v: string) => PromiseLike<void>) | null,
      type: string
    ) => {
      if (!values?.length) return;

      for (const value of values) {
        if (allureFn) {
          await allureFn(value);
        }
        addAnnotation(type, value);
      }
    };

    // ===== Core hierarchy =====
    await handleSingle(meta.epic, allure.epic, 'epic');
    await handleSingle(meta.feature, allure.feature, 'feature');

    if (meta.story) {
      const stories = Array.isArray(meta.story) ? meta.story : [meta.story];
      await handleMultiple(stories, allure.story, 'story');
    }

    await handleSingle(meta.severity, allure.severity, 'severity');
    await handleSingle(meta.owner, allure.owner, 'owner');

    if (meta.component) {
      await allure.label('component', meta.component);
      addAnnotation('allure:component', meta.component);
    }

    // ===== Tags =====
    if (meta.tags?.length) {
      await allure.tags(...meta.tags);
      meta.tags.forEach((tag: string) => addAnnotation('allure:tag', tag));
    }

    // ===== Issues =====
    if (meta.issues?.length) {
      for (const issue of meta.issues) {
        if (issue.url) {
          await allure.issue(issue.url, issue.id);
        } else {
          await allure.label('issue', issue.id);
        }

        addAnnotation('allure:issue', issue.id);
      }
    }

    // ===== TMS =====
    if (meta.tmsLinks?.length) {
      for (const tms of meta.tmsLinks) {
        if (tms.url) {
          await allure.tms(tms.url, tms.id);
        } else {
          await allure.label('tms', tms.id);
        }

        addAnnotation('allure:tms', tms.id);
      }
    }

    // ===== Description =====
    if (meta.description) {
      await allure.description(meta.description);
      addAnnotation('allure:description', meta.description);
    }

    Logger.info(
      `Allure metadata attached: ${meta.epic || ''} > ${meta.feature || ''} > ${
        Array.isArray(meta.story) ? meta.story.join(', ') : meta.story || ''
      }`
    );
  }

  /**
   * Execute and record a named step in the Allure report
   *
   * @template T
   * @param name - Step description
   * @param body - Async step execution block
   * @returns Result of step execution
   */
  static async step<T>(name: string, body: () => Promise<T>): Promise<T> {
    Logger.info(`📍 STEP: ${name}`);
    return await test.step(name, body);
  }

  /**
   * Attach a PNG screenshot to the current test report
   *
   * @param name - Screenshot attachment title
   * @param screenshot - Image file Buffer or filesystem path string
   */
  static async attachScreenshot(name: string, screenshot: Buffer | string): Promise<void> {
    try {
      let buffer: Buffer;

      if (typeof screenshot === 'string') {
        buffer = fs.readFileSync(screenshot);
      } else {
        buffer = screenshot;
      }

      await test.info().attach(name, {
        body: buffer,
        contentType: 'image/png',
      });

      Logger.info(`Screenshot attached: ${name}`);
    } catch (error) {
      Logger.error(`Failed to attach screenshot: ${error}`);
    }
  }

  /**
   * Attach WebM video recording to current test report
   *
   * @param name - Attachment title
   * @param videoPath - Path to video file on disk
   */
  static async attachVideo(name: string, videoPath: string): Promise<void> {
    try {
      if (!fs.existsSync(videoPath)) {
        Logger.warn(`Video file not found: ${videoPath}`);
        return;
      }

      const stats = fs.statSync(videoPath);
      const fileSizeMB = stats.size / (1024 * 1024);

      if (fileSizeMB > 50) {
        Logger.warn(
          `Video file too large (${fileSizeMB.toFixed(2)}MB), skipping attachment: ${videoPath}`
        );
        await AllureReporter.attachText(
          'video-location',
          `Video too large to attach. Location: ${videoPath}`
        );
        return;
      }

      const videoBuffer = fs.readFileSync(videoPath);

      await test.info().attach(name, {
        body: videoBuffer,
        contentType: 'video/webm',
      });

      Logger.info(`Video attached: ${name} (${fileSizeMB.toFixed(2)}MB)`);
    } catch (error) {
      Logger.error(`Failed to attach video: ${error}`);
    }
  }

  /**
   * Attach plain text content to current test report
   *
   * @param name - Attachment title
   * @param content - Text string content
   */
  static async attachText(name: string, content: string): Promise<void> {
    try {
      await test.info().attach(name, {
        body: content,
        contentType: 'text/plain',
      });

      Logger.info(`Text attached: ${name}`);
    } catch (error) {
      Logger.error(`Failed to attach text: ${error}`);
    }
  }

  /**
   * Attach formatted JSON object or string to current test report
   *
   * @param name - Attachment title
   * @param data - Target object or data structure to stringify
   */
  static async attachJSON(name: string, data: unknown): Promise<void> {
    try {
      const jsonString = JSON.stringify(data, null, 2);

      await test.info().attach(name, {
        body: jsonString,
        contentType: 'application/json',
      });

      Logger.info(`JSON attached: ${name}`);
    } catch (error) {
      Logger.error(`Failed to attach JSON: ${error}`);
    }
  }

  /**
   * Attach HTML document content to current test report
   *
   * @param name - Attachment title
   * @param html - Raw HTML markup string
   */
  static async attachHTML(name: string, html: string): Promise<void> {
    try {
      await test.info().attach(name, {
        body: html,
        contentType: 'text/html',
      });

      Logger.info(`HTML attached: ${name}`);
    } catch (error) {
      Logger.error(`Failed to attach HTML: ${error}`);
    }
  }

  /**
   * Add a generic web hyperlink to Allure report
   *
   * @param name - Link title label
   * @param url - Destination web URL
   */
  static addLink(name: string, url: string): void {
    void allure.link(url, name);
    Logger.info(`Link added: ${name} -> ${url}`);
  }

  /**
   * Add an issue ticket link to Allure report (e.g., Jira ticket)
   *
   * @param issueId - Ticket key identifier (e.g. 'JIRA-123')
   * @param url - Optional full URL link
   */
  static addIssue(issueId: string, url?: string): void {
    if (url) {
      void allure.issue(url, issueId);
    } else {
      void allure.label('issue', issueId);
    }

    Logger.info(`Issue linked: ${issueId}`);
  }

  /**
   * Add a Test Management System (TMS) test case link
   *
   * @param tmsId - TMS ID identifier (e.g. 'TC-101')
   * @param url - Optional direct URL to test management tool
   */
  static addTMS(tmsId: string, url?: string): void {
    if (url) {
      void allure.tms(url, tmsId);
    } else {
      void allure.label('tms', tmsId);
    }

    Logger.info(`TMS linked: ${tmsId}`);
  }

  /**
   * Add text description to current test
   *
   * @param description - Detailed Markdown or plain text description
   */
  static async addDescription(description: string): Promise<void> {
    const testInfo = test.info() as AllureTestInfo;

    if (testInfo[EXPLICIT_DESCRIPTION_SET]) {
      return;
    }

    await allure.description(description);
  }

  /**
   * Add classification tags to current test
   *
   * @param tags - Array of tag strings
   */
  static async addTags(tags: string[]): Promise<void> {
    if (tags.length) {
      await allure.tags(...tags);
    }
  }

  /**
   * Attach CSV spreadsheet data to Allure report
   *
   * @param name - Attachment title
   * @param data - Array of record objects or raw CSV string
   */
  static async attachCSV(
    name: string,
    data: Array<Record<string, unknown>> | string
  ): Promise<void> {
    try {
      let csvContent: string;

      if (typeof data === 'string') {
        csvContent = data;
      } else {
        const headers = Object.keys(data[0] || {});
        const rows = data.map((obj) => headers.map((h) => String(obj[h] ?? '')).join(','));
        csvContent = [headers.join(','), ...rows].join('\n');
      }

      await test.info().attach(name, {
        body: csvContent,
        contentType: 'text/csv',
      });

      Logger.info(`CSV attached: ${name}`);
    } catch (error) {
      Logger.error(`Failed to attach CSV: ${error}`);
    }
  }

  /**
   * Log environment information to Allure report log output
   */
  static logEnvironmentInfo(): void {
    const envInfo = PlaywrightConfigHelper.getEnvironmentInfo();
    Logger.info(`Environment Info: ${JSON.stringify(envInfo)}`);
  }
}
