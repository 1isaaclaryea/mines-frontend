# Backend Integration for Data Submission

## Summary

The data submission functionality has been updated to follow the same process as the Angular implementation. The error "Failed to upload file" was occurring because the React frontend was only saving to OneDrive without submitting to the backend API.

## Changes Made

### 1. Created API Service (`src/services/apiService.ts`)
- New service file that handles backend communication
- Implements `submitDataEntry()` function matching the Angular `api.service.ts` pattern
- Follows the same API endpoint: `POST /api/data-entry`
- Includes error handling and authentication header support

### 2. Updated Data Entry Component (`src/components/mining/DataEntryPanelWithOneDrive.tsx`)
- Added import for `submitDataEntry` from API service
- Added `employeeId` state (currently defaults to 'EMP001')
- Updated `handleSubmit` function to:
  - Transform spreadsheet data into the format expected by backend
  - Match the Angular implementation's data structure
  - Call backend API before saving to OneDrive
  - Handle errors properly with user-friendly messages

### 3. Data Transformation
The submit function now transforms the spreadsheet data to match the Angular format:

```typescript
{
  "SOLN Au (ppm)": {
    values: [
      { time: "06:00", value: 1.23 },
      { time: "07:00", value: 1.45 }
    ]
  },
  "% SOLIDS": {
    values: [...]
  },
  // ... other columns
}
```

## Backend Route Verified

The backend route at `C:\Users\Isaac\Documents\angular\mines\backend1\server.js` (line 295) confirms:
- **Endpoint**: `POST /api/data-entry`
- **Authentication**: Required (JWT token in Authorization header)
- **Payload**: `{ employeeId, section, data }`
- **Response**: Creates or updates data entry in MongoDB

## ⚠️ IMPORTANT: Authentication Required

The backend requires JWT authentication, but the React frontend doesn't currently implement backend authentication. The submission will fail with a **401 Unauthorized** error until authentication is implemented.

### To Fix Authentication:

1. **Implement Backend Login**:
   - Create a login API call to `POST /api/login` (backend endpoint exists)
   - Store JWT token in localStorage or authentication context
   - Update `getAuthHeaders()` in `apiService.ts` to include the token

2. **Quick Fix Option**:
   - Temporarily disable authentication middleware on the `/api/data-entry` route in the backend
   - Or create a test token for development

3. **Proper Implementation**:
   ```typescript
   // In apiService.ts, update getAuthHeaders():
   const token = localStorage.getItem('authToken');
   if (token) {
     headers['Authorization'] = `Bearer ${token}`;
   }
   ```

## Environment Variables

The backend URL is configured in `.env`:
```
VITE_BACKEND_URL="https://mines-backend1-production.up.railway.app/api"
```

## Testing

Once authentication is implemented:

1. Sign in to Microsoft (for OneDrive access)
2. Load the test file
3. Enter data in the spreadsheet
4. Click "Submit Data"
5. Data will be:
   - Submitted to backend API
   - Saved to OneDrive
   - Status set to "pending" for supervisor approval

## Next Steps

1. **Implement backend authentication** (highest priority)
2. Get actual employee ID from logged-in user
3. Test data submission end-to-end
4. Implement approval/rejection API calls for supervisors
5. Add data retrieval to load existing entries

## Files Modified

- ✅ `src/services/apiService.ts` (created)
- ✅ `src/components/mining/DataEntryPanelWithOneDrive.tsx` (updated)
- ✅ `src/vite-env.d.ts` (already had type definitions)

## TypeScript Note

The TypeScript error about `import.meta.env` should resolve automatically once the IDE refreshes. The type definitions are correctly defined in `src/vite-env.d.ts`.
