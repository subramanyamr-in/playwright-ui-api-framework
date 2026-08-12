import { PathConstants, SetupConstants } from '@constants/index.js';
import fs from 'fs';
import type { TransformableInfo } from 'logform';
import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';

const baseFolder = process.env.REPORT_ROOT || path.join(process.cwd(), 'reports');

if (!process.env.REPORT_ROOT) {
  console.warn('REPORT_ROOT is not set, falling back to %s', baseFolder);
}

const logDir = path.join(baseFolder, PathConstants.LOG_FOLDER_PATH);

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const workerId = process.env.TEST_WORKER_INDEX ?? '0';

const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true })
);

const consoleFormat = winston.format.combine(
  baseFormat,
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message }: TransformableInfo) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

const fileFormat = winston.format.combine(
  baseFormat,
  winston.format.printf(({ timestamp, level, message }: TransformableInfo) => {
    return `${timestamp} [${String(level).toUpperCase()}]: ${message}`;
  })
);

const rotateTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: `testLog_w${workerId}_%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'debug',
  format: fileFormat,
});

export class Logger {
  private static formatMessage(message: string, context?: Record<string, unknown>): string {
    if (!context || Object.keys(context).length === 0) {
      return message;
    }
    return `${message} ${JSON.stringify(context)}`;
  }

  private static readonly logger = winston.createLogger({
    level: process.env.LOG_LEVEL || SetupConstants.INFO,
    transports: [new winston.transports.Console({ format: consoleFormat }), rotateTransport],
  });

  static debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  static consoleOnly(message: string): void {
    console.log(message);
  }

  static info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(this.formatMessage(message, context));
  }

  static warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(this.formatMessage(message, context));
  }

  static error(message: string, context?: Record<string, unknown>): void {
    this.logger.error(this.formatMessage(message, context));
  }

  static step(message: string): void {
    this.logger.info(`[STEP] ${message}`);
  }

  static initTestSuite(name: string): void {
    this.logger.info(`=== Starting Test Suite: ${name} ===`);
  }

  static termTestSuite(name: string): void {
    this.logger.info(`=== Completed Test Suite: ${name} ===`);
    this.logger.info(SetupConstants.LOGGER_LINE_SEPARATOR);
  }

  static initTest(name: string): void {
    this.logger.info(`-- Start Test: ${name}`);
  }

  static termTest(name: string): void {
    this.logger.info(`-- End Test: ${name}`);
    this.logger.info(SetupConstants.LOGGER_LINE_SEPARATOR);
  }
}

export const logger = Logger;
