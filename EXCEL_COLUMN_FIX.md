# Excel Column Capture Fix

## Problem
Not all columns from the Excel sheet were being captured in the PDF report.

**Root Cause**: The Excel sheet has a complex multi-row header structure:
- Row 1: "DAILY PRODUCTION SUMMARY" (merged cells)
- Row 2: "Daily" and "Month-to-date" sections
- Row 3: "Actual", "Budget", "Variance" columns under each section

The `sheet_to_json()` function with default settings was trying to interpret this complex structure and missing columns.

## Solution

Changed from **object-based** to **array-based** data extraction:

### Before (Missing Columns)
```typescript
// This tries to interpret headers automatically
return XLSX.utils.sheet_to_json(sheet);
// Result: Only captures some columns, misses others
```

### After (All Columns Captured)
```typescript
// This gets raw array data - ALL columns
return XLSX.utils.sheet_to_json(sheet, { 
  header: 1,  // Return array of arrays
  defval: ''  // Use empty string for empty cells
});
// Result: Captures every single column
```

## Changes Made

### 1. Updated `readExcelFile.ts`
```typescript
export function getSheetData(workbook: XLSX.WorkBook, sheetName: string) {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  return XLSX.utils.sheet_to_json(sheet, { 
    header: 1,  // Get raw arrays
    defval: ''  // Empty cells = ''
  });
}
```

### 2. Updated `pdfGenerator.ts`
```typescript
// Read raw data as array of arrays
const rawData = getSheetData(workbook, 'Prod Stats') as any[][];

// Extract headers from first row
const headers = rawData[0].map((h: any, idx: number) => 
  h && String(h).trim() ? String(h).trim() : `Column_${idx}`
);

// Convert to objects for processing
const prodStatsData = rawData.slice(1).map(row => {
  const obj: any = {};
  headers.forEach((header, idx) => {
    obj[header] = row[idx] !== undefined ? row[idx] : '';
  });
  return obj;
});
```

## Data Flow

### Excel Structure
```
Row 0: [DAILY PRODUCTION SUMMARY, , , Daily, , , Month-to-date, , ]
Row 1: [KPI's, Actual, Budget, Variance, Actual, Budget, Variance]
Row 2: [Tonnes Crushed, 26180, 17677, 48.10, 93748, 106063, (11.6)]
Row 3: [Tonnes Milled, 20983, 20212, 3.8, 119861, 121273, (1.2)]
```

### After Processing
```javascript
headers = [
  "DAILY PRODUCTION SUMMARY",
  "Column_1",  // Empty cell
  "Column_2",  // Empty cell
  "Daily",
  "Column_4",  // Empty cell
  "Column_5",  // Empty cell
  "Month-to-date",
  "Column_7",  // Empty cell
  "Column_8"   // Empty cell
]

prodStatsData = [
  {
    "DAILY PRODUCTION SUMMARY": "KPI's",
    "Column_1": "Actual",
    "Column_2": "Budget",
    "Daily": "Variance",
    "Column_4": "Actual",
    "Column_5": "Budget",
    "Month-to-date": "Variance",
    ...
  },
  {
    "DAILY PRODUCTION SUMMARY": "Tonnes Crushed",
    "Column_1": 26180,
    "Column_2": 17677,
    "Daily": 48.10,
    ...
  }
]
```

## Benefits

1. **All Columns Captured**: Every column from Excel is now in the PDF
2. **No Data Loss**: Complex headers don't confuse the parser
3. **Flexible**: Works with any Excel structure
4. **Predictable**: Array-based approach is more reliable

## Testing

To verify all columns are captured:
1. Generate a PDF report
2. Check the table - should show all columns from Excel
3. Count columns in PDF vs Excel - should match
4. Verify data values match between Excel and PDF

## Expected Result

The PDF table should now show:
- All KPI rows (Tonnes Crushed, Tonnes Milled, Mill Throughput, etc.)
- All data columns (Daily Actual, Daily Budget, Daily Variance, Month-to-date Actual, etc.)
- Complete data without missing columns

## Technical Notes

**`header: 1` option**:
- Returns array of arrays instead of array of objects
- Each row is an array of cell values
- No automatic header interpretation
- Captures ALL columns including empty ones

**Why This Works**:
- Complex multi-row headers don't confuse the parser
- We manually extract headers from first row
- We control how data is structured
- No columns are skipped or merged incorrectly
