# Impact Chart Data Fix

## Problem
The "Impact of Plant KPI's on Gold Produced" chart was showing but with no visible bars. The values were appearing near 0 instead of showing the actual impact values like -77, 132, and 152.

## Root Cause
The data extraction logic wasn't correctly:
1. Finding the impact column in the Excel data
2. Parsing numeric values that might be formatted as strings with commas or parentheses

## Solution Applied

### 1. Improved Column Detection
```typescript
// Before: Simple search that might miss the column
const impactCol = kpiOzHeaders.find(h => h.includes('Impact'));

// After: More robust search with fallback
const impactCol = kpiOzHeaders.find(h => 
  String(h).toLowerCase().includes('impact') || 
  String(h).toLowerCase().includes('oz produced')
) || kpiOzHeaders[kpiOzHeaders.length - 1]; // Fallback to last column
```

### 2. Enhanced Value Parsing
```typescript
const rawValue = row[impactCol];
let impactValue = 0;

if (typeof rawValue === 'number') {
  impactValue = rawValue;
} else if (typeof rawValue === 'string') {
  // Remove commas: "1,234" -> "1234"
  let cleanValue = rawValue.replace(/,/g, '');
  
  // Handle parentheses for negative numbers: "(77)" -> "-77"
  if (cleanValue.includes('(') && cleanValue.includes(')')) {
    cleanValue = '-' + cleanValue.replace(/[()]/g, '');
  }
  
  impactValue = parseFloat(cleanValue) || 0;
}
```

### 3. Added Debug Logging
```typescript
console.log('KPI Headers:', kpiOzHeaders);
console.log('KPI Data Sample:', kpiOzData[0]);
console.log('Impact Column:', impactCol);
console.log(`${kpiName}: ${rawValue} -> ${impactValue}`);
console.log('Impact Data for Chart:', impactData);
```

### 4. Improved Chart Configuration
```typescript
scales: {
  y: {
    beginAtZero: false,  // Changed from true to show negative values properly
    grid: { color: 'rgba(0, 0, 0, 0.1)' },
    title: {
      display: true,
      text: 'Impact (Oz)',
      font: { size: 12, weight: 'bold' }
    },
    ticks: {
      font: { size: 11 }
    }
  },
  x: {
    grid: { display: false },
    ticks: {
      font: { size: 11, weight: 'bold' }
    }
  }
}
```

## Data Flow Example

### Excel Data
```
| Tonnes Milled | ... | Impact of the KPI to Oz produced |
| Tonnes Milled | ... | (77)                             |
| Head Grade    | ... | 132                              |
| Recovery      | ... | 152                              |
```

### After Parsing
```javascript
impactData = [
  { name: "Tonnes Milled", value: -77 },   // (77) -> -77
  { name: "Head Grade", value: 132 },      // 132 -> 132
  { name: "Recovery", value: 152 }         // 152 -> 152
]
```

### Chart Output
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
  RED      GREEN     GREEN
```

## Value Parsing Cases Handled

1. **Plain Numbers**: `132` -> `132`
2. **Negative in Parentheses**: `(77)` -> `-77`
3. **Numbers with Commas**: `1,234` -> `1234`
4. **Negative with Commas**: `(1,234)` -> `-1234`
5. **String Numbers**: `"152"` -> `152`
6. **Empty/Null**: `""` or `null` -> `0`

## Color Coding

- **Negative Values** (< 0): Red `rgba(231, 76, 60, 0.8)`
  - Indicates negative impact on gold production
  - Example: Tonnes Milled with -77 Oz
  
- **Positive Values** (> 0): Green `rgba(46, 204, 113, 0.8)`
  - Indicates positive impact on gold production
  - Example: Head Grade with +132 Oz
  - Example: Recovery with +152 Oz

## Debug Output

When generating the PDF, check the browser console for:
```
KPI Headers: ["Plant Budget KPI's", "t", "141485", ...]
KPI Data Sample: { "Plant Budget KPI's": "Tonnes Milled", ... }
Impact Column: "Impact of the KPI to Oz produced"
Tonnes Milled: (77) -> -77
Head Grade: 132 -> 132
Recovery: 152 -> 152
Impact Data for Chart: [
  { name: "Tonnes Milled", value: -77 },
  { name: "Head Grade", value: 132 },
  { name: "Recovery", value: 152 }
]
```

## Expected Result

The chart should now display:
- Three visible bars with correct heights
- Red bar for Tonnes Milled (negative impact)
- Green bars for Head Grade and Recovery (positive impacts)
- Y-axis showing range from approximately -100 to 200
- Clear labels for each KPI

## Testing

To verify the fix:
1. Generate a PDF report
2. Navigate to page 3 (KPI's vs OZ + Carbon Column)
3. Check the "Impact of Plant KPI's on Gold Produced" chart
4. Verify bars are visible with correct heights
5. Verify colors: Red for negative, Green for positive
6. Check browser console for debug output

## Technical Notes

### Y-Axis Configuration
Changed `beginAtZero: false` to properly display negative values. This ensures the scale adjusts to show both negative and positive values clearly.

### Column Detection Strategy
1. Search for columns containing "impact" (case-insensitive)
2. Search for columns containing "oz produced" (case-insensitive)
3. Fallback to last column if no match found

### Value Type Handling
The code handles both numeric and string values from Excel, as the xlsx library may return either depending on cell formatting.
