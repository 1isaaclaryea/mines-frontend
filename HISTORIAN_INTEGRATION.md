# Historian Data Integration

## Overview
The ProcessParametersPanel has been updated to fetch and display real-time hourly historian data from the backend API for the `FIX.G_LAMP.F_CV` tag.

## Changes Made

### 1. Updated ProcessParametersPanel Component
**File**: `src/components/mining/ProcessParametersPanel.tsx`

#### Added Features:
- **Historian Data Fetching**: Automatically fetches hourly aggregated data for the last 24 hours on component mount
- **Real-time Chart Display**: Shows historian data in the parameter trend charts when available
- **Loading States**: Displays a loading indicator while fetching data
- **Error Handling**: Shows error messages and falls back to mock data if the API call fails
- **Live Data Badge**: Indicates when real historian data is being displayed

#### New Functions:
- `formatDateForHistorian()`: Formats JavaScript Date objects to `YYYY-MM-DD HH:MM:SS` format required by the historian server
- `fetchHistorianData()`: Fetches hourly aggregated data from the backend `/api/historian/data/hourly` endpoint
- `transformHistorianDataForChart()`: Transforms historian data into the format required by the chart component

#### State Management:
- `historianData`: Stores the fetched historian data points
- `isLoadingHistorian`: Tracks loading state
- `historianError`: Stores any error messages

### 2. Updated API Service
**File**: `src/services/apiService.ts`

- Exported `getAuthHeaders()` function to be used by other components for authenticated API calls

### 3. Environment Configuration
**File**: `.env.example`

- Added `VITE_BACKEND_URL` configuration example

## Backend API Endpoint

The component expects the backend to have the following endpoint:

```
GET /api/historian/data/hourly
```

### Query Parameters:
- `tags`: The tag name (e.g., "FIX.G_LAMP.F_CV")
- `startTime`: Timestamp in format `YYYY-MM-DD HH:MM:SS` (e.g., "2025-11-04 21:14:41")
- `endTime`: Timestamp in format `YYYY-MM-DD HH:MM:SS` (e.g., "2025-11-05 21:14:41")

### Expected Response:
```json
{
  "success": true,
  "count": 24,
  "data": [
    {
      "tagname": "FIX.G_LAMP.F_CV",
      "timestamp": "2024-01-01 00:00:00",
      "value": 123.45,
      "count": 60
    }
  ],
  "query_params": {...},
  "aggregated": true,
  "aggregation_type": "hourly_average"
}
```

## Usage

### Environment Setup
1. Ensure your `.env` file has the backend URL configured:
   ```
   VITE_BACKEND_URL=http://localhost:5000/api
   ```

2. Ensure the backend server is running and the historian endpoint is accessible

### Viewing Historian Data
1. Navigate to the Process Parameters page
2. Click on any parameter card to open the trend dialog
3. The chart will automatically display:
   - Real historian data if available (with "Live Data" badge)
   - Loading indicator while fetching
   - Error message with fallback to mock data if fetch fails

## Data Flow

```
Component Mount
    ↓
Fetch Historian Data (24 hours)
    ↓
Transform Data for Chart
    ↓
Display in Line Chart
```

## Error Handling

The component implements graceful degradation:
1. **Loading State**: Shows a loading spinner while fetching data
2. **Error State**: Displays error message and falls back to mock data
3. **Success State**: Shows real historian data with a "Live Data" badge

## Future Enhancements

Potential improvements:
- Add date range selector to fetch custom time periods
- Add refresh button to manually reload data
- Support multiple tags simultaneously
- Add data export functionality
- Implement real-time updates using WebSockets
- Add data quality indicators
- Cache historian data to reduce API calls

## Testing

To test the integration:
1. Start the backend server with the historian endpoint
2. Start the frontend development server
3. Navigate to Process Parameters
4. Open the developer console to see fetch logs
5. Click on a parameter to view the trend chart
6. Verify that real data is displayed (check for "Live Data" badge)

## Troubleshooting

### No Data Displayed
- Check that `VITE_BACKEND_URL` is correctly set in `.env`
- Verify the backend server is running
- Check browser console for error messages
- Ensure authentication token is valid

### TypeScript Errors
- The `import.meta.env` TypeScript errors should resolve automatically
- If they persist, restart the TypeScript server in your IDE

### CORS Issues
- Ensure the backend has CORS configured to allow requests from the frontend origin
