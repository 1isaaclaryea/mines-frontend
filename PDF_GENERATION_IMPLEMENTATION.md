# PDF Generation Implementation

## Overview
Implemented automated PDF report generation that reads data from the "Prod Stats" sheet in the Excel file and creates a professionally formatted PDF with visualizations.

## Dependencies Installed

```json
{
  "jspdf": "^2.5.x",
  "jspdf-autotable": "^3.x.x",
  "chart.js": "^4.x.x"
}
```

## Features

### 1. **Professional PDF Layout**
- **Header Section**: Blue banner with report title and generation date
- **Executive Summary**: Key statistics and metadata
- **Data Table**: First 15 rows with up to 6 columns, styled with alternating row colors
- **Visualizations**: Two charts on a separate page
- **Footer**: Page numbers and branding on all pages

### 2. **Dynamic Charts**

#### **Bar Chart**
- Displays the first numeric column distribution
- Shows up to 10 records
- Color: Professional blue theme
- Includes grid lines and labels

#### **Pie Chart**
- Shows distribution of top 6 values
- Multi-color segments for easy distinction
- Legend positioned on the right
- Percentage-based visualization

### 3. **Data Processing**
- Automatically reads "Prod Stats" sheet from Excel file
- Detects numeric columns for calculations
- Handles missing/null values gracefully
- Formats numbers to 2 decimal places

## Implementation Details

### File Structure

```
src/
├── utils/
│   ├── pdfGenerator.ts       # PDF generation logic
│   ├── readExcelFile.ts      # Excel reading utilities
│   └── excelTemplates.ts     # Excel generation (existing)
└── components/
    └── mining/
        └── ReportGenerationPanel.tsx  # Updated with PDF support
```

### Key Functions

#### `generateProdStatsPDF(reportConfig)`
Main function that orchestrates PDF generation:
1. Reads Excel file from `/public` folder
2. Extracts "Prod Stats" sheet data
3. Creates PDF with jsPDF
4. Adds header, summary, table, and charts
5. Downloads the file

#### `createChartImage(config, width, height)`
Helper function that:
- Creates a temporary canvas element
- Renders Chart.js chart
- Converts to base64 PNG image
- Returns image data for PDF embedding

## Usage

### User Flow
1. Navigate to Report Generation page
2. Enter report title
3. Select date range
4. Choose sections (optional)
5. Select **"PDF Report"** as format
6. Click **"Generate PDF"**
7. PDF automatically downloads

### Generated PDF Structure

```
┌─────────────────────────────────────┐
│  HEADER (Blue Banner)               │
│  - Report Title                     │
│  - Generation Date                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  EXECUTIVE SUMMARY                  │
│  - Total Records                    │
│  - Date Range                       │
│  - Data Columns                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PRODUCTION DATA TABLE              │
│  (First 15 rows, 6 columns)         │
│  - Styled headers                   │
│  - Alternating row colors           │
└─────────────────────────────────────┘

[NEW PAGE]

┌─────────────────────────────────────┐
│  DATA VISUALIZATIONS                │
│                                     │
│  [Bar Chart]                        │
│  Distribution of first numeric col  │
│                                     │
│  [Pie Chart]                        │
│  Top 6 values distribution          │
└─────────────────────────────────────┘

Footer: Page X of Y | Platform Name
```

## Customization Options

### Modify Chart Types
Edit `pdfGenerator.ts` to change chart configurations:

```typescript
// Change bar chart to line chart
const barChartConfig: ChartConfiguration = {
  type: 'line',  // Changed from 'bar'
  // ... rest of config
};
```

### Adjust Colors
Update color schemes in the chart configurations:

```typescript
backgroundColor: 'rgba(41, 128, 185, 0.7)',  // Blue
borderColor: 'rgba(41, 128, 185, 1)',
```

### Add More Charts
Add additional chart sections after the pie chart:

```typescript
// Add line chart
yPosition += 100;
const lineChartImage = await createChartImage(lineChartConfig);
pdf.addImage(lineChartImage, 'PNG', 15, yPosition, 180, 90);
```

### Modify Table Display
Adjust the table in the `autoTable` call:

```typescript
autoTable(pdf, {
  head: [tableHeaders],
  body: tableData,
  startY: yPosition,
  theme: 'striped',  // Change theme: 'plain', 'grid', 'striped'
  // ... more options
});
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Missing Sheet**: Shows error if "Prod Stats" sheet doesn't exist
2. **Empty Data**: Validates data exists before processing
3. **Invalid Values**: Handles null/undefined values gracefully
4. **Chart Rendering**: Waits for charts to render before capturing
5. **User Feedback**: Toast notifications for success/failure

## Performance Considerations

- **Chart Rendering**: 500ms delay per chart for proper rendering
- **Canvas Cleanup**: Charts are destroyed after image capture
- **Memory Management**: Temporary canvas elements are removed
- **Data Limiting**: Only first 15 rows in table, 10 in bar chart, 6 in pie chart

## Future Enhancements

Potential improvements:
- [ ] Add more chart types (line, scatter, radar)
- [ ] Support multiple sheets in one PDF
- [ ] Add statistical analysis section
- [ ] Include trend analysis
- [ ] Add custom branding/logo
- [ ] Support for custom color themes
- [ ] Export options (A4, Letter, Legal sizes)
- [ ] Multi-language support
- [ ] Email delivery option

## Technical Notes

### Chart.js Registration
Chart.js requires component registration:
```typescript
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
```

### jsPDF AutoTable Types
The library includes TypeScript support via declaration merging:
```typescript
import autoTable from 'jspdf-autotable';
// TypeScript knows about pdf.lastAutoTable
```

### Canvas in Node/SSR
This implementation requires a browser environment (uses `document.createElement`). For SSR, consider using `canvas` package.

## Troubleshooting

### Charts Not Appearing
- Ensure Chart.js components are registered
- Check canvas rendering timeout (increase if needed)
- Verify chart data is not empty

### PDF Layout Issues
- Adjust `yPosition` increments between sections
- Check page height calculations
- Use `pdf.addPage()` when needed

### Memory Issues
- Limit data rows for large datasets
- Destroy charts after use
- Remove temporary DOM elements

## Example Output

**Filename**: `Production_Stats_Report_2025-11-08.pdf`

**Contents**:
- Professional header with branding
- Summary statistics
- Formatted data table
- Bar chart showing distribution
- Pie chart showing proportions
- Page numbers and footer
