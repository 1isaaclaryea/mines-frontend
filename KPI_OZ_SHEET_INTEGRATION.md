# KPI's vs OZ + Carbon Column Sheet Integration

## Overview
Added support for the "KPI's vs OZ +Carbon Column" sheet in the PDF report, including both the data table and the impact chart.

## What Was Added

### New Page 3: KPI's vs OZ Analysis

The PDF report now includes a third page with:

1. **KPI vs OZ Data Table**
   - All columns from the sheet
   - Formatted with professional styling
   - Shows Plant Budget KPI's, Achieved %, Actual Performance, and Impact data

2. **Impact Chart**
   - Bar chart showing "Impact of Plant KPI's on Gold Produced"
   - Color-coded bars:
     - **Red**: Negative impact
     - **Green**: Positive impact
   - Shows impact for:
     - Tonnes Milled
     - Head Grade
     - Recovery

## Implementation Details

### Data Extraction

```typescript
// Read KPI's vs OZ +Carbon Column sheet
const kpiOzRawData = getSheetData(workbook, "KPI's vs  OZ +Carbon Column");

// Convert to objects
const kpiOzHeaders = kpiOzRawData[0].map((h: any, idx: number) => 
  h && String(h).trim() ? String(h).trim() : `Column_${idx}`
);

const kpiOzData = kpiOzRawData.slice(1).map(row => {
  const obj: any = {};
  kpiOzHeaders.forEach((header, idx) => {
    obj[header] = row[idx] !== undefined ? row[idx] : '';
  });
  return obj;
});
```

### Table Generation

```typescript
// Filter out empty column headers
const kpiTableHeaders = kpiOzHeaders.filter(h => !h.startsWith('Column_'));

// Create table with all data
autoTable(pdf, {
  head: [kpiTableHeaders],
  body: kpiTableData,
  theme: 'grid',
  headStyles: {
    fillColor: [41, 128, 185],
    fontSize: 8
  },
  bodyStyles: {
    fontSize: 7
  }
});
```

### Chart Generation

```typescript
// Extract impact data for specific KPIs
const impactData = kpiOzData
  .filter(row => {
    const kpiName = row[kpiOzHeaders[0]];
    return ['Tonnes Milled', 'Head Grade', 'Recovery'].includes(kpiName);
  })
  .map(row => {
    const impactCol = kpiOzHeaders.find(h => h.includes('Impact'));
    return {
      name: row[kpiOzHeaders[0]],
      value: parseFloat(row[impactCol])
    };
  });

// Create bar chart with color coding
const impactChartConfig = {
  type: 'bar',
  data: {
    labels: impactData.map(d => d.name),
    datasets: [{
      data: impactData.map(d => d.value),
      backgroundColor: impactData.map(d => 
        d.value < 0 ? 'rgba(231, 76, 60, 0.8)' : 'rgba(46, 204, 113, 0.8)'
      )
    }]
  }
};
```

## PDF Structure (Updated)

```
Page 1: Production Data Overview
├── Header
├── Executive Summary
└── Production Data Table

Page 2: Data Visualizations
├── Bar Chart (Production Distribution)
└── Pie Chart (Production Breakdown)

Page 3: KPI's vs OZ Analysis (NEW)
├── KPI vs OZ Data Table
│   ├── Plant Budget KPI's
│   ├── Achieved %
│   ├── Actual Performance
│   └── Impact of the KPI to Oz produced
└── Impact Chart
    ├── Tonnes Milled (impact value)
    ├── Head Grade (impact value)
    └── Recovery (impact value)
```

## Data Mapping

### Table Columns
From the Excel sheet:
- Column 1: KPI names (Tonnes Milled, Head Grade, Recovery, etc.)
- Column 2: Units (t, g/t, %, Oz)
- Column 3: Plant Budget KPI's
- Column 4: Achieved %
- Column 5: Actual Performance
- Column 6: Impact of the KPI to Oz produced

### Chart Data
Extracts three specific KPIs:
1. **Tonnes Milled**: Shows impact on gold production
2. **Head Grade**: Shows impact on gold production
3. **Recovery**: Shows impact on gold production

## Color Coding

### Chart Colors
- **Negative Impact** (< 0): Red `rgba(231, 76, 60, 0.8)`
  - Example: Tonnes Milled with -77 Oz impact
- **Positive Impact** (> 0): Green `rgba(46, 204, 113, 0.8)`
  - Example: Head Grade with +132 Oz impact
  - Example: Recovery with +152 Oz impact

### Table Colors
- **Header**: Blue `rgb(41, 128, 185)`
- **Alternating Rows**: Light gray `rgb(245, 245, 245)`

## Features

### Automatic Detection
- Automatically finds the "Impact" column
- Filters relevant KPI rows
- Handles missing or empty data gracefully

### Dynamic Sizing
- Table adjusts to fit all columns
- Chart scales based on data values
- Font sizes optimized for readability

### Error Handling
- Validates sheet exists
- Handles missing columns
- Provides fallback for empty data

## Example Output

### Table
```
| Plant Budget KPI's | t    | 141485 | 97.1 | 137,342 | -77  |
| Head Grade         | g/t  | 0.70   | 105.7| 0.74    | 132  |
| Recovery           | %    | 82.2   | 105.8| 86.94   | 152  |
| Total Gold...      | Oz   | 2,646  | 107.6| 2,848   | 202  |
```

### Chart
```
Impact of Plant KPI's on Gold Produced
┌────────────────────────────────┐
│                                │
│  200 ┤                    ┌──┐ │
│  150 ┤            ┌──┐    │  │ │
│  100 ┤            │  │    │  │ │
│   50 ┤            │  │    │  │ │
│    0 ┼────────────┼──┼────┼──┼ │
│  -50 ┤  ┌──┐      │  │    │  │ │
│ -100 ┤  │  │      │  │    │  │ │
│      └──┴──┴──────┴──┴────┴──┴ │
│      Tonnes   Head    Recovery │
│      Milled   Grade             │
└────────────────────────────────┘
```

## Benefits

1. **Comprehensive Analysis**: Shows both data and visual impact
2. **Color-Coded Insights**: Quickly identify positive/negative impacts
3. **Professional Presentation**: Matches Excel chart styling
4. **Automatic Updates**: Reads latest data from Excel file

## Future Enhancements

Potential improvements:
- [ ] Add more KPI metrics to chart
- [ ] Include trend lines
- [ ] Add percentage labels on bars
- [ ] Support for multiple time periods
- [ ] Comparison with previous reports
- [ ] Custom color schemes based on thresholds

## Technical Notes

### Sheet Name
The exact sheet name must be: `"KPI's vs  OZ +Carbon Column"` (note the double space)

### Data Structure
The implementation assumes:
- Row 1: Headers
- Rows 2+: Data
- Specific KPI names: "Tonnes Milled", "Head Grade", "Recovery"

### Chart Type
Uses Chart.js bar chart with:
- Horizontal orientation
- Color-coded bars based on value sign
- Grid lines for readability
- No legend (colors are self-explanatory)
