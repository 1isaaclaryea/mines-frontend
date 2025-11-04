# Data Entry Panel - Excel Integration

## Overview
The DataEntryPanel component has been redesigned to support Excel file loading and editing, similar to the Angular implementation using Syncfusion spreadsheet.

## Technology Stack
- **react-spreadsheet**: Lightweight Excel-like spreadsheet component for React
- **xlsx (SheetJS)**: Library for reading and writing Excel files
- **React hooks**: useState, useRef, useCallback for state management

## Key Features

### 1. Excel File Support
- **Load Excel Files**: Users can upload `.xlsx` or `.xls` files directly into the spreadsheet
- **Export to Excel**: Export current spreadsheet data to Excel format with proper formatting
- **Automatic Conversion**: Excel data is automatically converted to spreadsheet format

### 2. Section Management
Three sections matching the Angular implementation:
- **CIL Plant Monitoring** (type: 'cil')
- **Crushing Shift Tonnes** (type: 'crushing')
- **SAG01 Mill** (type: 'sag')

### 3. Time Slot Generation
Automatically generates 12-hour shift time slots based on current time:
- **Day Shift**: 6:00 AM - 6:00 PM (if current time is 6 AM - 6 PM)
- **Night Shift**: 6:00 PM - 6:00 AM (if current time is 6 PM - 6 AM)
- 13 hourly time slots per shift

### 4. Approval Workflow
- **Pending**: Initial status after data submission
- **Approved**: Supervisor has approved the data
- **Rejected**: Supervisor has rejected the data (returns to pending)

### 5. Role-Based Access
- **Operator**: Can enter data, submit for approval
- **Supervisor**: Can review, edit, approve, or reject data

## Component Structure

```typescript
interface DataEntryPanelProps {
  userRole: UserRole; // 'operator' | 'supervisor'
}
```

## Usage

```tsx
import { DataEntryPanel } from './components/mining/DataEntryPanel';

<DataEntryPanel userRole="operator" />
```

## Data Format

### CIL Plant Monitoring Columns
1. TIME (readonly)
2. SOLN Au (ppm)
3. % SOLIDS
4. pH
5. CN CONC (ppm)
6. DO (mg/L)
7. CAR CONC (g/L)

## Future Enhancements

### Phase 1 (Current)
- ✅ Excel file loading and editing
- ✅ Section selection
- ✅ Time slot generation
- ✅ Approval workflow
- ✅ Export to Excel

### Phase 2 (Planned)
- 🔄 Microsoft Graph API integration for OneDrive
- 🔄 Real-time collaboration
- 🔄 Azure App Service backend integration
- 🔄 Automatic data sync with OneDrive Excel files
- 🔄 Version history and audit trail

## API Integration Points

When ready to connect to the backend, update these functions:

1. **handleSubmit**: Replace mock API call with actual submission
2. **handleApprove**: Connect to approval endpoint
3. **handleReject**: Connect to rejection endpoint
4. **handleSectionChange**: Load actual section data from API
5. **handleFileUpload**: Optional - upload file to server for processing

## Styling

The component includes custom CSS for the spreadsheet to match the application theme:
- Border colors use CSS variables
- Readonly cells have muted background
- Focus states use primary color
- Responsive design with proper spacing

## Notes

- The spreadsheet data is stored in React state as a Matrix of CellBase objects
- First row (headers) and first column (time) are marked as readonly
- Excel files are read using FileReader API in the browser
- Export uses XLSX.writeFile for client-side file generation
