# Share Link Diagnostics Guide

## Error: "Failed to get file from share link"

This guide will help you diagnose and fix share link issues.

## Step 1: Check the Console

Open your browser's developer console (F12) and look for detailed error messages:

### Common Error Messages

#### Error 403: Permission Denied
```
Share link error response: { error: { code: "accessDenied", message: "..." } }
```

**Cause**: Missing `Sites.Read.All` permission

**Solution**:
1. Sign out from the app
2. Clear session storage: `sessionStorage.clear()` in console
3. Sign in again
4. Accept ALL permissions in the consent screen
5. Look for "Read items in all site collections"

#### Error 401: Unauthorized
```
Share link error response: { error: { code: "unauthenticated", message: "..." } }
```

**Cause**: Invalid or expired authentication token

**Solution**:
1. Sign out and sign in again
2. If problem persists, clear all browser data for localhost
3. Restart the dev server

#### Error 404: Not Found
```
Share link error response: { error: { code: "itemNotFound", message: "..." } }
```

**Cause**: 
- Share link is invalid, expired, or revoked
- File has been deleted
- Link format is incorrect

**Solution**:
1. Verify the share link works in a browser
2. Get a fresh share link from OneDrive
3. Check the link format (see below)

#### Error 400: Bad Request
```
Share link error response: { error: { code: "invalidRequest", message: "..." } }
```

**Cause**: Malformed share link or encoding issue

**Solution**:
1. Copy the ENTIRE share link including all parameters
2. Don't modify the link
3. Make sure there are no extra spaces

## Step 2: Verify Share Link Format

### Valid OneDrive Share Link Formats

✅ **Personal OneDrive**:
```
https://1drv.ms/x/c/cd9b8bbddc064ce4/ETC57QOscAdLkE3ooTGKaUABU7zBvuRiGPK9GGtAZO5QTw?e=b6a6X9
```

✅ **OneDrive for Business**:
```
https://contoso-my.sharepoint.com/:x:/g/personal/user_contoso_com/ETC57QOscAdLkE3ooTGKaUABU7zBvuRiGPK9GGtAZO5QTw?e=b6a6X9
```

❌ **Invalid formats**:
- Direct file URLs: `https://onedrive.live.com/edit.aspx?resid=...`
- Embed URLs: `https://onedrive.live.com/embed?...`
- Download URLs: `https://onedrive.live.com/download?...`

### How to Get a Valid Share Link

1. Go to [OneDrive](https://onedrive.live.com)
2. Find your Excel file
3. Right-click → **Share**
4. Click **Copy link** (NOT "Email" or "More options")
5. Paste the entire link into the app

## Step 3: Check Permissions in Azure Portal

If you're still having issues, verify the app registration:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Find your app (Client ID: `910e8af9-4c7e-4c3b-8dd4-fcc194f16def`)
4. Click **API permissions**
5. Verify these permissions are listed:
   - ✅ Microsoft Graph → User.Read (Delegated)
   - ✅ Microsoft Graph → Files.ReadWrite.All (Delegated)
   - ✅ Microsoft Graph → Sites.Read.All (Delegated)
6. Check if "Admin consent required" shows "Yes" or "No"
7. If you're an admin, click **Grant admin consent**

## Step 4: Test with Microsoft Graph Explorer

Test if the share link works with Microsoft Graph API directly:

1. Go to [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Sign in with your Microsoft account
3. Click **Modify permissions** → Add `Sites.Read.All`
4. Encode your share link:
   ```javascript
   // In browser console
   const shareUrl = "YOUR_SHARE_LINK_HERE";
   const base64 = btoa(shareUrl);
   const encoded = base64.replace(/=+$/, '').replace(/\//g, '_').replace(/\+/g, '-');
   console.log(encoded);
   ```
5. Run this query in Graph Explorer:
   ```
   GET https://graph.microsoft.com/v1.0/shares/u!{ENCODED_URL}/driveItem
   ```
6. If this works, the issue is with your app's authentication
7. If this fails, the issue is with the share link or permissions

## Step 5: Check Browser Console Logs

Look for these specific log messages:

### Success:
```
Attempting to decode share link...
Encoded URL: aHR0cHM6Ly8xZHJ2Lm1zL3gvYy9jZDliOGJiZGRjMDY0Y2U0L0VUQzU3UU9zY0FkTGtFM29vVEdLYVVBQlU3ekJ2dVJpR1BLOUdHdEFaTzVRVHc_ZT1iNmE2WDk
File retrieved from share link: 01L3LKPP4NQFKJ42UDZVEJXUM72B6WNPVO
```

### Failure:
```
Attempting to decode share link...
Encoded URL: aHR0cHM6Ly8xZHJ2Lm1zL3gvYy9jZDliOGJiZGRjMDY0Y2U0L0VUQzU3UU9zY0FkTGtFM29vVEdLYVVBQlU3ekJ2dVJpR1BLOUdHdEFaTzVRVHc_ZT1iNmE2WDk
Share link error response: { error: { code: "accessDenied", message: "Access denied" } }
Error getting file from share link: Error: HTTP 403: {"error":{"code":"accessDenied"}}
```

## Step 6: Alternative Methods

If share links continue to fail, try these alternatives:

### Method 1: Use File ID Directly

1. Open the file in OneDrive web
2. Look at the URL: `https://onedrive.live.com/edit.aspx?resid=ABC123!456`
3. The File ID is the `resid` value: `ABC123!456`
4. Enter this in the "File ID" field instead

### Method 2: Use File Path

If the file is in your OneDrive:
```
Documents/MyFile.xlsx
```

### Method 3: Download and Upload Locally

1. Download the Excel file from OneDrive
2. Use "Load Excel" button in the app
3. Edit the data
4. Use "Export Excel" to save

## Common Scenarios

### Scenario 1: Personal Microsoft Account
- ✅ Share links work
- ✅ File IDs work for YOUR files only
- ❌ Can't access other users' files directly

### Scenario 2: Work/School Account (Office 365)
- ✅ Share links work
- ✅ File IDs work for accessible files
- ✅ Can access shared files from colleagues
- ⚠️ May require admin consent for permissions

### Scenario 3: Shared File from Another User
- ✅ Use share link (easiest)
- ❌ File ID won't work (it's not in your OneDrive)
- ❌ File path won't work (it's not in your OneDrive)

## Quick Troubleshooting Checklist

- [ ] Share link is in correct format (1drv.ms or sharepoint.com)
- [ ] Copied the ENTIRE link including parameters
- [ ] Signed in with the correct Microsoft account
- [ ] Granted all permissions (including Sites.Read.All)
- [ ] Cleared session storage and signed in again
- [ ] Checked browser console for detailed errors
- [ ] Verified the link works in OneDrive web
- [ ] Tested with a file in YOUR OneDrive first

## Still Not Working?

### Debug Mode

Add this to your browser console to see detailed token info:
```javascript
// Check current session
console.log('Session Storage:', sessionStorage);

// Check if signed in
console.log('Accounts:', window.msal?.getAllAccounts());

// Check token scopes
const accounts = window.msal?.getAllAccounts();
if (accounts?.[0]) {
  window.msal.acquireTokenSilent({
    scopes: ["User.Read", "Files.ReadWrite.All", "Sites.Read.All"],
    account: accounts[0]
  }).then(response => {
    console.log('Token scopes:', response.scopes);
    console.log('Token expires:', new Date(response.expiresOn));
  }).catch(error => {
    console.error('Token error:', error);
  });
}
```

### Contact Support

If none of these solutions work, provide:
1. Browser console error messages
2. Share link format (without the actual link)
3. Account type (personal/work/school)
4. Screenshot of the error
5. Steps you've already tried

## Prevention Tips

1. **Always use fresh share links**: Don't reuse old links
2. **Test with your own files first**: Before using shared files
3. **Keep permissions updated**: Sign out/in after permission changes
4. **Use incognito mode**: To test without cached credentials
5. **Check OneDrive status**: Sometimes OneDrive itself has issues
