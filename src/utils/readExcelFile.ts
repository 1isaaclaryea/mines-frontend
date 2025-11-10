import * as XLSX from 'xlsx';

/**
 * Reads an Excel file from a URL (e.g., from public folder)
 * @param url - URL to the Excel file
 * @returns Promise with workbook data
 */
export async function readExcelFromUrl(url: string) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  return workbook;
}

/**
 * Gets data from a specific sheet
 * @param workbook - XLSX workbook object
 * @param sheetName - Name of the sheet to read
 * @returns Array of objects representing rows
 */
export function getSheetData(workbook: XLSX.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  // Use header: 1 to get raw array data (includes all columns)
  // This prevents xlsx from trying to interpret complex headers
  return XLSX.utils.sheet_to_json(sheet, { 
    header: 1,  // Return array of arrays instead of objects
    defval: ''  // Use empty string for empty cells
  });
}

/**
 * Gets all sheet names from a workbook
 */
export function getSheetNames(workbook: XLSX.WorkBook): string[] {
  return workbook.SheetNames;
}

/**
 * Extracts a specific sheet and downloads it as a new Excel file
 */
export async function extractAndDownloadSheet(
  fileUrl: string,
  sheetName: string,
  outputFilename: string
) {
  const workbook = await readExcelFromUrl(fileUrl);
  
  // Check if sheet exists
  if (!workbook.Sheets[sheetName]) {
    throw new Error(`Sheet "${sheetName}" not found in workbook. Available sheets: ${workbook.SheetNames.join(', ')}`);
  }
  
  // Create a new workbook with only the specified sheet
  const newWorkbook = XLSX.utils.book_new();
  const sheet = workbook.Sheets[sheetName];
  XLSX.utils.book_append_sheet(newWorkbook, sheet, sheetName);
  
  // Download the new workbook
  XLSX.writeFile(newWorkbook, outputFilename);
}
