# Asset Management Guide

This document explains how static assets are managed in this Vite + React application.

## Overview

This application uses **two approaches** for managing assets, depending on the use case:

### 1. Public Directory (`/public`)

**Purpose**: Static files that are served as-is without processing.

**Use Cases**:
- Downloadable templates (Excel, PDF)
- Static documents
- Favicon and manifest files
- Files that need predictable URLs

**How it works**:
- Files in `/public` are copied directly to the build output
- Accessed via absolute paths: `/filename.ext`
- Not processed by Vite's build pipeline
- URLs remain the same in development and production

**Example**:
```typescript
// Download a file from public directory
const downloadFile = () => {
  const link = document.createElement('a');
  link.href = '/template.xlsx';
  link.download = 'template.xlsx';
  link.click();
};
```

### 2. Imported Assets (`/src/assets`)

**Purpose**: Assets that are imported and used within components.

**Use Cases**:
- Images used in UI components
- SVG icons
- Fonts
- CSS files

**How it works**:
- Files are imported in code
- Processed by Vite (optimized, hashed filenames)
- URLs change based on content (cache-busting)

**Example**:
```typescript
import logo from './assets/logo.png';

function Header() {
  return <img src={logo} alt="Logo" />;
}
```

## Excel Template Implementation

For the report generation feature, we use **programmatic Excel generation** with the `xlsx` library instead of storing static template files.

### Why Programmatic Generation?

1. **Dynamic Content**: Templates can be customized based on report configuration
2. **No Binary Files**: Avoids committing binary Excel files to Git
3. **Maintainability**: Template structure is defined in code
4. **Flexibility**: Easy to modify and version control

### Implementation

Located in `/src/utils/excelTemplates.ts`:

```typescript
import * as XLSX from 'xlsx';

// Generate empty template
export function downloadReportTemplate() {
  const wb = generateReportTemplate();
  XLSX.writeFile(wb, 'mining_report_template.xlsx');
}

// Generate populated report
export function downloadPopulatedReport(config, data, filename) {
  const wb = generatePopulatedReport(config, data);
  XLSX.writeFile(wb, filename);
}
```

### Usage in Components

```typescript
import { downloadReportTemplate, downloadPopulatedReport } from '@/utils/excelTemplates';

// Download empty template
<Button onClick={() => downloadReportTemplate()}>
  Download Template
</Button>

// Generate report with data
<Button onClick={() => downloadPopulatedReport(config, data, 'report.xlsx')}>
  Generate Report
</Button>
```

## Best Practices

### When to Use Public Directory
- ✅ Static downloadable files
- ✅ Files that don't change often
- ✅ Files that need consistent URLs
- ✅ Large files that shouldn't be bundled

### When to Use Imported Assets
- ✅ Images used in components
- ✅ Files that need optimization
- ✅ Assets that benefit from cache-busting
- ✅ Files that are part of the component logic

### When to Generate Programmatically
- ✅ Excel/CSV reports with dynamic data
- ✅ PDFs with variable content
- ✅ Files that need to be customized per user
- ✅ Templates that change frequently

## File Structure

```
frontend/
├── public/                    # Static assets (served as-is)
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── assets/               # Imported assets (processed by Vite)
│   │   ├── images/
│   │   └── fonts/
│   └── utils/
│       └── excelTemplates.ts # Programmatic file generation
```

## Dependencies

- **xlsx** (^0.18.5): Excel file generation and parsing
- Already included in `package.json`

## Additional Resources

- [Vite Static Asset Handling](https://vitejs.dev/guide/assets.html)
- [SheetJS Documentation](https://docs.sheetjs.com/)
