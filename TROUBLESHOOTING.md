# Troubleshooting Guide

## 404 Error When Loading OneDrive Files

### Problem
After signing in successfully, you get a 404 error when trying to load a file:
```
GET https://graph.microsoft.com/v1.0/me/drive/items/{FILE_ID}/content 404 (Not Found)
```

### Root Cause
The File ID you're using is either:
1. **Incorrect or invalid** - The file doesn't exist with that ID
2. **Not accessible** - The file is not in your OneDrive or you don't have permissions
3. **From a different account** - The file belongs to a different Microsoft account

### Solution: Use OneDrive Share Links (Easiest Method)

Instead of manually entering File IDs, use OneDrive share links:

#### Step 1: Get a Share Link
1. Open [OneDrive](https://onedrive.live.com)
2. Navigate to your Excel file
3. Right-click the file → **Share**
4. Click **Copy link**
5. You'll get a link like:
   ```
   https://1drv.ms/x/c/cd9b8bbddc064ce4/ETC57QOscAdLkE3ooTGKaUABU7zBvuRiGPK9GGtAZO5QTw?e=b6a6X9
   ```

#### Step 2: Use in the App
1. Sign in to Microsoft in the app
2. In the **OneDrive Configuration** section:
   - Paste the share link in the **"Share Link (Easiest)"** field
   - Enter the worksheet name (default: `Sheet1`)
3. Click **"Load from OneDrive"**
4. The app will:
   - ✅ Automatically extract the File ID
   - ✅ Display the File ID for future use
   - ✅ Load the Excel data

#### Step 3: Save the File ID (Optional)
After loading from a share link, the File ID will appear in the "File ID" field. You can copy it for faster access next time.

### Alternative Methods

#### Method 1: File Path
If your file is in your personal OneDrive:
```
Documents/MyFile.xlsx
```

#### Method 2: Direct File ID
If you already have a valid File ID:
```
01L3LKPP4NQFKJ42UDZVEJXUM72B6WNPVO
```

**Note:** File IDs only work if the file is in YOUR OneDrive account.

### How to Verify Your File ID

1. **Using Share Link** (Recommended):
   - Get a share link from OneDrive
   - Paste it in the app
   - The app will show you the correct File ID

2. **Using OneDrive Web**:
   - Open the file in OneDrive web
   - Check the URL: `https://onedrive.live.com/edit.aspx?resid={FILE_ID}!123`
   - The `resid` parameter contains the File ID

3. **Using Microsoft Graph Explorer**:
   - Go to [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
   - Sign in
   - Try: `GET /me/drive/root/children`
   - Find your file and copy its `id` property

### Common Issues

#### Issue: "Failed to get file from share link" or Authentication Error
**Causes:**
- **Missing `Sites.Read.All` permission** (most common!)
- Link has expired or been revoked
- You don't have permission to access the file
- File has been deleted or moved
- Network connection issue

**Solutions:**
1. **Check permissions** (see [Permissions Guide](./PERMISSIONS_GUIDE.md)):
   - Sign out from the app
   - Clear browser session storage
   - Sign in again and accept all permissions
   - Make sure you see "Read items in all site collections" in consent screen
2. Verify the link works in OneDrive
3. Check you're signed in with the correct Microsoft account
4. Ask the file owner to reshare with you
5. Try copying the link again

#### Issue: "File ID retrieved but data won't load"
**Causes:**
- Worksheet name is incorrect (case-sensitive!)
- File is not an Excel file
- File is corrupted

**Solutions:**
1. Check the worksheet name matches exactly
2. Verify the file opens correctly in Excel Online
3. Try a different worksheet name (e.g., "Sheet1", "Data", etc.)

#### Issue: "Please sign in to access OneDrive"
**Causes:**
- Not signed in to Microsoft
- Session expired

**Solutions:**
1. Click "Sign in to OneDrive" button
2. Complete the Microsoft login flow
3. Try loading the file again

### Best Practices

1. **For First-Time Access**: Use share links (easiest)
2. **For Repeated Access**: Save the File ID after first load
3. **For Team Collaboration**: Share the link with team members
4. **For Production**: Store File ID in environment variables

### Testing Your Setup

1. Create a test Excel file in OneDrive
2. Get a share link for it
3. Paste the link in the app
4. Verify it loads successfully
5. Note the File ID for future use

### Need More Help?

Check these resources:
- [OneDrive Quickstart Guide](./ONEDRIVE_QUICKSTART.md)
- [Share Link Guide](./SHARE_LINK_GUIDE.md)
- [README OneDrive Section](./README_ONEDRIVE.md)

### Technical Details

The app now supports three methods to access OneDrive files (in priority order):

1. **Share Link** → Calls `/shares/u!{encodedUrl}/driveItem` → Gets File ID
2. **File Path** → Calls `/me/drive/root:/{path}` → Gets File ID
3. **File ID** → Directly uses the ID

All methods eventually use the File ID to download the file content via:
```
GET /me/drive/items/{fileId}/content
```

The 404 error occurs when the File ID doesn't exist or isn't accessible in your OneDrive account.
