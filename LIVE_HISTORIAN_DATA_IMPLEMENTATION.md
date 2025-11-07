# Live Historian Data Implementation

## Overview
The Process Parameters page now fetches and displays live data from the historian server for both analog process parameters and digital equipment status.

## Changes Made

### 1. API Service Updates (`src/services/apiService.ts`)

Added historian data fetching functions:

#### `getAnalogHistorianData(tags, startTime, endTime)`
- Fetches analog process parameter data for specified time range
- Used for continuous measurements (cyanide level, pH, density, etc.)
- Parameters:
  - `tags`: Comma-separated list of tag names
  - `startTime`: JavaScript Date object for start of range
  - `endTime`: JavaScript Date object for end of range
- Returns: `HistorianResponse` with array of data points

#### `getDigitalHistorianData(tag)`
- Fetches latest digital value for equipment status
- Used for on/off status (pumps, generators, etc.)
- Parameters:
  - `tag`: Single tag name
- Returns: `DigitalHistorianResponse` with latest value (1 or 0)

### 2. Process Parameters Panel Updates (`src/components/mining/ProcessParametersPanel.tsx`)

#### Tag Mappings

**Analog Parameters:**
```typescript
FIX.CN_LEVEL_.F_CV - Cyanide Level - CIL Tank 1
FIX.D0.F_CV - Dissolved Oxygen - CIL Tank 1
FIX.DENSITY.F_CV - Density
FIX.PERCENTAGE_SOLIDS.F_CV - Percentage solids
FIX.PH_LEVEL.F_CV - pH Level
```

**Digital Equipment:**
```typescript
FIX.CN_DOSING_PUMP.F_CV - Cyanide Dosing Pump
FIX.PSA3.F_CV - Oxygen Generation Plant
FIX.RECOVERY_PUMP.F_CV - Recovery Pump
FIX.RECOVERY_SCREEN.F_CV - Carbon Screening System
FIX.TANK1_AGITATOR.F_CV - CIL Tank 3 Agitator
```

#### Real-time Data Fetching

**Parameter Values (Every 30 seconds):**
- Fetches last 5 minutes of data for all analog tags
- Extracts latest value for each parameter
- Calculates status (optimal/caution/critical) based on deviation from target
- Determines trend (up/down/stable)
- Updates UI with current values and timestamps

**Equipment Status (Every 30 seconds):**
- Fetches digital value for each equipment tag
- Value of 1 = Running (optimal status)
- Value of 0 = Offline (offline status)
- Updates equipment cards with real-time status

**Chart Data (On parameter selection):**
- Fetches data from 00:00 (midnight) to current time
- Displays full day's trend
- Falls back to mock data if fetch fails

#### Chart Enhancements

**Brush Component:**
- Added interactive brush for time window selection
- Users can drag to zoom into specific time ranges
- Located at bottom of chart
- Height: 30px
- Allows detailed analysis of specific periods

**Visual Indicators:**
- **"Live Data" badge** (green) - When real historian data is displayed
- **"Mock Data" badge** (yellow) - When using fallback data
- **Loading spinner** - While fetching data
- **Error message** - If fetch fails

**Chart Configuration:**
- Height increased to 400px (from 300px) to accommodate brush
- X-axis labels angled at -45° for better readability
- Bottom margin increased to 60px for rotated labels
- Smaller dots (r: 2) for cleaner appearance with more data points

## Data Flow

### Parameter Values
```
Component Mount
    ↓
Fetch Last 5 Minutes (All Analog Tags)
    ↓
Extract Latest Value per Tag
    ↓
Calculate Status & Trend
    ↓
Update Parameter Cards
    ↓
Repeat Every 30 Seconds
```

### Equipment Status
```
Component Mount
    ↓
Fetch Digital Value (Each Equipment Tag)
    ↓
Check if Running (1) or Offline (0)
    ↓
Update Equipment Cards
    ↓
Repeat Every 30 Seconds
```

### Chart Data
```
User Clicks Parameter
    ↓
Show Loading Spinner
    ↓
Fetch Data (00:00 to Now)
    ↓
Transform for Chart Format
    ↓
Display with Brush
    ↓
User Can Zoom/Pan with Brush
```

## Backend API Requirements

### Analog Data Endpoint
```
GET /api/historian/data
Query Parameters:
  - tags: Comma-separated tag names
  - start_time: YYYY-MM-DD HH:MM:SS
  - end_time: YYYY-MM-DD HH:MM:SS
Response:
{
  "data": [
    {
      "tag": "FIX.CN_LEVEL_.F_CV",
      "timestamp": "2025-11-06 10:30:00",
      "value": 2.8
    }
  ]
}
```

### Digital Data Endpoint
```
GET /api/historian/digital
Query Parameters:
  - tag: Single tag name
Response:
{
  "success": true,
  "tag": "FIX.CN_DOSING_PUMP.F_CV",
  "value": 1,
  "timestamp": "2025-11-06 10:30:00"
}
```

## User Experience

### Parameter Cards
- Show real-time values updated every 30 seconds
- Status badges (optimal/caution/critical) based on deviation from target
- Trend indicators (up/down/stable arrows)
- Timestamp of last update
- Click to view detailed trend chart

### Equipment Cards
- Show real-time on/off status
- Green "Running" badge when equipment is on (value = 1)
- Red "Offline" badge when equipment is off (value = 0)
- Updates every 30 seconds

### Trend Charts
- Full day's data (00:00 to current time)
- Interactive brush for zooming
- Drag brush handles to select time window
- Live data badge when showing real historian data
- Automatic fallback to mock data if fetch fails
- Loading indicator during data fetch

## Error Handling

### Graceful Degradation
1. **Network Errors**: Falls back to mock data, shows warning
2. **Authentication Errors**: Logs error, continues with mock data
3. **No Data**: Uses mock data generation
4. **Partial Data**: Uses available data, fills gaps with mock data

### User Feedback
- Loading spinners during data fetch
- Error messages with specific failure reasons
- Visual badges indicating data source (live vs mock)
- Console logs for debugging

## Performance Optimizations

1. **Batched Requests**: Fetches all analog tags in single request
2. **Interval Management**: Clears intervals on component unmount
3. **Conditional Fetching**: Chart data only fetched when dialog opens
4. **Efficient Updates**: Only updates changed values
5. **Debounced Rendering**: Chart updates smoothly with brush

## Testing

### Verify Live Data
1. Open Process Parameters page
2. Check parameter cards show "Loading..." initially
3. Values should update within 5 seconds
4. Click any parameter to open chart
5. Look for "Live Data" badge (green)
6. Verify brush appears at bottom of chart
7. Drag brush to zoom into time range

### Verify Equipment Status
1. Check equipment cards on right side
2. Status should show "Running" or "Offline"
3. Badges should be green (running) or red (offline)
4. Status updates every 30 seconds

### Test Brush Functionality
1. Click parameter to open chart
2. Locate brush at bottom of chart
3. Drag left handle to adjust start time
4. Drag right handle to adjust end time
5. Drag middle to pan time window
6. Chart should zoom to selected range

### Test Error Handling
1. Disconnect from backend
2. Parameter cards should show last known values
3. Chart should fall back to mock data
4. "Mock Data" badge should appear (yellow)
5. Error message should be visible

## Future Enhancements

1. **Custom Time Ranges**: Allow user to select specific date ranges
2. **Data Export**: Download chart data as CSV
3. **Comparison Mode**: Compare multiple parameters on same chart
4. **Alerts**: Set thresholds and receive notifications
5. **Historical Playback**: Replay past data at different speeds
6. **Aggregation Options**: Switch between raw, hourly, daily data
7. **Real-time Updates**: WebSocket connection for instant updates
8. **Data Quality Indicators**: Show data gaps or quality issues

## Troubleshooting

### No Live Data Showing
1. Check backend is running and accessible
2. Verify `.env` has correct `VITE_BACKEND_URL`
3. Check browser console for errors
4. Verify authentication token exists in localStorage
5. Check backend logs for historian connection issues

### Brush Not Working
1. Ensure recharts version supports Brush component
2. Check chart has sufficient data points (>10)
3. Verify chart height is adequate (>300px)
4. Check browser console for errors

### Equipment Status Not Updating
1. Verify digital tags are correct
2. Check backend digital endpoint is working
3. Verify historian server returns 1 or 0 values
4. Check console for fetch errors

## Related Files

- `src/services/apiService.ts` - API functions
- `src/components/mining/ProcessParametersPanel.tsx` - Main component
- `HISTORIAN_INTEGRATION.md` - Previous integration docs
- `HISTORIAN_AUTH_FIX.md` - Authentication troubleshooting
