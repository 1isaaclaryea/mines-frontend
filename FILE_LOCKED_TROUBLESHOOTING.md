# File Locked Error (423) Troubleshooting

## Problem
When trying to submit or approve data, you get an error:
```
PUT https://graph.microsoft.com/v1.0/me/drive/items/.../content 423 (Locked)
Error: File is locked by another process
```

## Cause
The Excel file is currently open or locked by:
- **Excel Online** (opened in browser)
- **Excel Desktop App** (opened on your computer)
- **Another user** viewing/editing the file
- **OneDrive sync** temporarily locking the file

## Solutions

### Quick Fix (Recommended)
1. **Close the file in Excel**
   - If you have the file open in Excel Online, close that browser tab
   - If you have the file open in Excel desktop app, close it
   - Wait a few seconds for OneDrive to sync

2. **Try again**
   - The system will automatically retry 3 times with delays
   - You'll see messages like "File is locked, retrying... (1/2)"

### If Problem Persists

#### Option 1: Wait and Retry
- Wait 30-60 seconds for OneDrive to finish syncing
- Try submitting/approving again
- The retry mechanism will handle temporary locks

#### Option 2: Check OneDrive Sync
1. Open OneDrive system tray icon
2. Check if files are syncing
3. Wait for sync to complete
4. Try again

#### Option 3: Use a Different Browser Tab
- Don't have the Excel file open in another browser tab
- Only work with the file through the React app interface
- Close any Excel Online tabs

#### Option 4: Check File Permissions
- Ensure you have edit permissions on the file
- Check if another user is currently editing
- In OneDrive, check "Manage Access" for the file

## Prevention Tips

### Best Practices
✅ **Don't open the file directly** - Work only through the React app
✅ **Close Excel tabs** - Don't have the file open in Excel Online
✅ **One user at a time** - Coordinate with team members
✅ **Wait for sync** - Give OneDrive time to sync after changes

### Workflow Recommendation
1. Sign in to the React app
2. Load the file (it loads automatically)
3. Edit data in the React spreadsheet interface
4. Submit/Approve (saves to OneDrive)
5. Don't open the file in Excel until you're done

## Technical Details

### What the System Does
The app now includes automatic retry logic:
- **3 retry attempts** with exponential backoff
- **1 second delay** after first failure
- **2 second delay** after second failure
- **Clear error message** if all retries fail

### Error Messages You'll See
- ✅ "File is locked, retrying... (1/2)" - System is retrying
- ✅ "File uploaded to OneDrive successfully" - Success!
- ❌ "File is locked. Close it in Excel and try again." - Manual action needed

## Advanced Troubleshooting

### Check File Lock Status
1. Go to OneDrive.com
2. Find the file
3. Check if it shows "Someone is editing"
4. Click "..." → "Details" to see who has it open

### Force Unlock (Last Resort)
1. Go to OneDrive.com
2. Find the file
3. Right-click → "Version history"
4. This sometimes releases locks
5. Or download a copy and use that instead

### Contact Support
If the file remains locked:
- Check with your IT department
- The file might be locked by a sync issue
- May need to recreate the file

## Code Changes Made

### Retry Logic Added
The `uploadExcelFile` function now:
```typescript
- Retries 3 times on 423 errors
- Uses exponential backoff (1s, 2s delays)
- Shows progress notifications
- Provides clear error messages
```

### User-Friendly Errors
- Detects 423 Locked errors specifically
- Shows actionable error messages
- Guides users to close the file
- Indicates when retrying

## Summary

**Most Common Solution**: Close the Excel file if you have it open anywhere, wait a few seconds, and try again. The system will automatically retry if the file is temporarily locked.
