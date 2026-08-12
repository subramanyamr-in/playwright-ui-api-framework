import * as fs from 'fs';
import * as xlsx from 'xlsx';
import { Logger } from './Logger.js';

// -----------------------------------------------------------------------------
// FileUtils - Synchronous & Asynchronous File & Excel Operations Utility
//
// PURPOSE:
// - Provides static helper methods for reading/writing local files, checking file size,
//   and parsing, validating, updating, and appending data in Excel workbooks via `xlsx`.
// -----------------------------------------------------------------------------

export class FileUtils {
  // -----------------------------------------------------------------------------
  // BASIC FILE SYSTEM OPERATIONS
  // -----------------------------------------------------------------------------

  /**
   * Reads the content of a file synchronously and returns a string if an encoding is provided.
   *
   * @param filePath - The absolute or relative path to the file.
   * @param encoding - The file encoding (e.g., 'utf-8') to return string content.
   * @returns File content as a string.
   */
  public static getFileContent(filePath: string, encoding: BufferEncoding): string;
  /**
   * Reads the content of a file synchronously and returns a Buffer if no encoding is provided.
   *
   * @param filePath - The absolute or relative path to the file.
   * @returns File content as a binary Buffer.
   */
  public static getFileContent(filePath: string): Buffer;
  public static getFileContent(filePath: string, encoding?: BufferEncoding): Buffer | string {
    try {
      const content = fs.readFileSync(filePath, encoding);
      return content;
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error(`Error reading file at "${filePath}": ${error.message}`);
        throw new Error(`Could not read file "${filePath}": ${error.message}`);
      } else {
        Logger.error(`Unexpected error reading file at "${filePath}": ${error}`);
        throw new Error(`Could not read file "${filePath}" due to an unexpected error.`);
      }
    }
  }

  /**
   * Retrieves the size of a specified file in bytes.
   *
   * @param filePath - Path to the target file.
   * @returns Number representing the file size in bytes.
   * @throws Error if the file cannot be accessed or stat fails.
   */
  public static getFileSize(filePath: string): number {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error(`Error getting file size for "${filePath}": ${error.message}`);
        throw new Error(`Failed to get file size for "${filePath}": ${error.message}`);
      } else {
        Logger.error(`Unexpected error while getting file size for "${filePath}": ${error}`);
        throw new Error(`Failed to get file size for "${filePath}" due to an unexpected error.`);
      }
    }
  }

  /**
   * Writes text content to a file synchronously using UTF-8 encoding.
   *
   * @param filePath - Path where the content will be saved.
   * @param content - String content to write.
   * @throws Error if writing to the file fails.
   */
  public static async writeFileContent(filePath: string, content: string): Promise<void> {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error(`Error writing file at "${filePath}": ${error.message}`);
        throw new Error(`Failed to write file at "${filePath}": ${error.message}`);
      } else {
        Logger.error(`Unexpected error while writing file at "${filePath}": ${error}`);
        throw new Error(`Failed to write file at "${filePath}" due to an unexpected error.`);
      }
    }
  }

  // -----------------------------------------------------------------------------
  // EXCEL READING & VALIDATION
  // -----------------------------------------------------------------------------

  /**
   * Reads the first worksheet of an Excel file and converts rows into JSON objects.
   *
   * @param filePath - Path to the target Excel file (`.xlsx`, `.xls`).
   * @returns Array of objects representing rows with header property keys.
   */
  public static extractExcelData(filePath: string): unknown[] {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return [];
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return [];
    }
    return xlsx.utils.sheet_to_json(worksheet);
  }

  /**
   * Validates that expected text substring(s) exist within the JSON content of an Excel file.
   *
   * @param filePath - Path to the target Excel file.
   * @param expectedData - Single string or array of strings expected to exist in the Excel file.
   * @returns True if all expected elements are present; otherwise false.
   */
  public static validateDataInExcel(filePath: string, expectedData: string | string[]): boolean {
    const jsonData = this.extractExcelData(filePath);
    const content = JSON.stringify(jsonData).replace(/\s+/g, ' ').trim();
    const dataToValidate: string[] =
      typeof expectedData === 'string' ? [expectedData] : expectedData;

    for (const data of dataToValidate) {
      if (!content.includes(data)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Retrieves all sheet names present in an Excel workbook.
   *
   * @param filePath - Path to the target Excel file.
   * @returns Array of worksheet names.
   */
  public static getExcelSheetNames(filePath: string): string[] {
    const workbook = xlsx.readFile(filePath);
    return workbook.SheetNames;
  }

  /**
   * Reads the raw value of a specific cell by 1-based row and column coordinates.
   *
   * @param filePath - Path to the Excel file.
   * @param sheetName - Name of the target sheet.
   * @param row - 1-based row index.
   * @param col - 1-based column index.
   * @returns Cell value, or undefined if the cell is empty or missing.
   * @throws Error if the specified sheet is not found.
   */
  public static getExcelCellValue(
    filePath: string,
    sheetName: string,
    row: number,
    col: number
  ): unknown {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
    const cellAddress = xlsx.utils.encode_cell({ r: row - 1, c: col - 1 });
    return sheet[cellAddress]?.v;
  }

  // -----------------------------------------------------------------------------
  // EXCEL WRITING & MUTATION
  // -----------------------------------------------------------------------------

  /**
   * Updates the value of a specific cell in an Excel sheet and saves the workbook.
   *
   * @param filePath - Path to the target Excel file.
   * @param sheetName - Target sheet name.
   * @param row - 1-based row index.
   * @param col - 1-based column index.
   * @param value - New primitive value to set (string or number).
   * @throws Error if the sheet is missing or saving fails.
   */
  public static updateExcelCellValue(
    filePath: string,
    sheetName: string,
    row: number,
    col: number,
    value: string | number
  ): void {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);
      const cellAddress = xlsx.utils.encode_cell({ r: row - 1, c: col - 1 });
      const cellType = typeof value === 'number' ? 'n' : 's';
      sheet[cellAddress] = { t: cellType, v: value };
      xlsx.writeFile(workbook, filePath);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error(`Error updating cell in "${filePath}": ${error.message}`);
        throw new Error(`Failed to update cell in "${filePath}": ${error.message}`);
      } else {
        Logger.error(`Unexpected error updating cell in "${filePath}": ${error}`);
        throw new Error(`Failed to update cell in "${filePath}" due to an unexpected error.`);
      }
    }
  }

  /**
   * Appends one or more rows of cell values to the end of a specified Excel sheet.
   *
   * @param filePath - Path to the target Excel file.
   * @param sheetName - Target sheet name.
   * @param dataRows - Array of row arrays containing cell values.
   * @throws Error if the sheet is missing or saving fails.
   */
  public static appendRowToExcel(
    filePath: string,
    sheetName: string,
    dataRows: (string | number | boolean | null)[][]
  ): void {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[sheetName];
      if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);

      const existingData: (string | number | boolean | null)[][] = xlsx.utils.sheet_to_json<
        (string | number | boolean | null)[]
      >(sheet, {
        header: 1,
      });

      for (const row of dataRows) {
        existingData.push(row);
      }

      const newSheet = xlsx.utils.aoa_to_sheet(existingData);
      workbook.Sheets[sheetName] = newSheet;
      xlsx.writeFile(workbook, filePath);
    } catch (error: unknown) {
      if (error instanceof Error) {
        Logger.error(`Error appending row in "${filePath}": ${error.message}`);
        throw new Error(`Failed to append row in "${filePath}": ${error.message}`);
      } else {
        Logger.error(`Unexpected error appending row in "${filePath}": ${error}`);
        throw new Error(`Failed to append row in "${filePath}" due to an unexpected error.`);
      }
    }
  }
}
