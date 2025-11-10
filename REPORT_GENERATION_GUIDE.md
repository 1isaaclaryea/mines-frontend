# Report Generation Guide

## Overview
The Report Generation feature now supports both Excel and PDF formats, reading data from the "Prod Stats" sheet in your Excel file.

## Features

### Excel Report
- Downloads the full Excel file: `Production Update November 25.xlsx`
- Contains all sheets including "Prod Stats"
- Original data preserved

### PDF Report
- Reads "Prod Stats" sheet data
- Generates professional PDF with:
  - Executive summary
  - Data table (first 15 rows)
  - Bar chart (distribution visualization)
  - Pie chart (proportional breakdown)
  - Professional styling and branding

## How to Use

### Step 1: Configure Report
1. Navigate to **Report Generation** page
2. Enter a **Report Title** (required)
3. Add optional **Description**
4. Select **Date Range**
5. Choose **Sections** to include (optional for PDF)

### Step 2: Select Format
Choose between:
- **PDF Report** - Formatted PDF with charts
- **Excel Workbook** - Original Excel file

### Step 3: Generate
Click **"Generate [FORMAT]"** button

### Step 4: Download
File automatically downloads:
- **Excel**: `Production Update November 25.xlsx`
- **PDF**: `Production_Stats_Report_YYYY-MM-DD.pdf`

## PDF Report Structure

### Page 1: Data Overview
```
┌─────────────────────────────────┐
│ HEADER (Blue Banner)            │
│ • Report Title                  │
│ • Generation Date               │
└─────────────────────────────────┘

EXECUTIVE SUMMARY
• Total Records: X
• Date Range: From - To
• Data Columns: X

PRODUCTION DATA
┌─────┬─────┬─────┬─────┐
│ Col1│ Col2│ Col3│ Col4│
├─────┼─────┼─────┼─────┤
│ Data│ Data│ Data│ Data│
└─────┴─────┴─────┴─────┘
(First 15 rows shown)
```

### Page 2: Visualizations
```
DATA VISUALIZATIONS

[Bar Chart]
Distribution of numeric data
• Up to 10 records
• Professional blue theme

[Pie Chart]
Proportional breakdown
• Top 6 values
• Multi-color segments
• Legend included
```

## Technical Details

### Dependencies
- **jspdf** (^3.0.3) - PDF generation
- **jspdf-autotable** (^5.0.2) - Table formatting
- **chart.js** (^4.5.1) - Chart creation
- **xlsx** (^0.18.5) - Excel reading

### File Locations
```
src/
├── utils/
│   ├── pdfGenerator.ts        # PDF generation logic
│   ├── readExcelFile.ts       # Excel reading utilities
│   └── excelTemplates.ts      # Excel templates
├── components/
│   └── mining/
│       └── ReportGenerationPanel.tsx
└── public/
    └── Production Update November 25.xlsx
```

## Customization

### Change PDF Colors
Edit `src/utils/pdfGenerator.ts`:
```typescript
// Header color
pdf.setFillColor(41, 128, 185); // RGB values

// Chart colors
backgroundColor: 'rgba(41, 128, 185, 0.7)'
```

### Adjust Data Limits
```typescript
// Table rows
.slice(0, 15)  // Change 15 to desired number

// Bar chart records
.slice(0, 10)  // Change 10 to desired number

// Pie chart segments
.slice(0, 6)   // Change 6 to desired number
```

### Add More Charts
In `pdfGenerator.ts`, after existing charts:
```typescript
// Add line chart
const lineChartConfig: ChartConfiguration = {
  type: 'line',
  data: { /* your data */ },
  options: { /* your options */ }
};

const lineChartImage = await createChartImage(lineChartConfig);
pdf.addImage(lineChartImage, 'PNG', 15, yPosition, 180, 90);
```

## Troubleshooting

### PDF Not Generating
**Issue**: Error message appears
**Solution**: 
- Check browser console for errors
- Verify "Prod Stats" sheet exists in Excel file
- Ensure Excel file is in `/public` folder

### Charts Not Showing
**Issue**: PDF has blank spaces where charts should be
**Solution**:
- Increase chart rendering timeout in `pdfGenerator.ts`
- Check that data contains numeric values
- Verify Chart.js is properly registered

### Excel File Not Downloading
**Issue**: Nothing happens when clicking Generate Excel
**Solution**:
- Verify file exists at `/public/Production Update November 25.xlsx`
- Check browser's download settings
- Look for blocked pop-ups

### Empty Data Table
**Issue**: Table shows no data
**Solution**:
- Verify "Prod Stats" sheet has data
- Check column names match expected format
- Ensure data is not filtered out

## Best Practices

### Report Titles
- Use descriptive names: "Daily Production Summary"
- Include date context: "November 2025 Report"
- Keep under 50 characters for PDF formatting

### Date Ranges
- Select meaningful periods
- Align with data availability
- Use consistent formats

### Data Quality
- Ensure numeric columns have valid numbers
- Remove empty rows from Excel sheet
- Use consistent column naming

## Examples

### Daily Operations Report
```
Title: Daily Operations Summary
Description: Production metrics for November 8, 2025
Date Range: 2025-11-08 to 2025-11-08
Format: PDF
```

### Weekly Performance Report
```
Title: Weekly Performance Analysis
Description: Week 45 production statistics
Date Range: 2025-11-01 to 2025-11-07
Format: Excel
```

### Monthly Executive Summary
```
Title: November 2025 Executive Summary
Description: Monthly production overview with trends
Date Range: 2025-11-01 to 2025-11-30
Format: PDF
```

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify file paths and names
3. Review implementation documentation
4. Check that all dependencies are installed

## Future Enhancements

Planned features:
- [ ] Multiple sheet selection for PDF
- [ ] Custom chart types
- [ ] Email delivery
- [ ] Scheduled reports
- [ ] Report templates
- [ ] Data filtering options
- [ ] Custom branding
- [ ] Multi-language support
