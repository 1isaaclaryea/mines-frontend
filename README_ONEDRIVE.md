# OneDrive Integration - Complete Guide

## 🎉 Share Link Support Added!

You can now use OneDrive share links directly in the application - no need to find File IDs!

## 🚀 Quick Start

### Your Share Link
```
https://1drv.ms/x/c/cd9b8bbddc064ce4/ETC57QOscAdLkE3ooTGKaUABU7zBvuRiGPK9GGtAZO5QTw?e=b6a6X9
```

### How to Use It

1. **Start the app**:
   ```bash
   npm run dev
   ```

2. **Sign in** to Microsoft (if not already signed in)

3. **In the OneDrive Configuration section**:
   - Paste your share link: `https://1drv.ms/x/c/cd9b8bbddc064ce4/...`
   - Worksheet name: `Sheet1`
   - Click **"Load from OneDrive"**

4. **Done!** Your Excel file is now loaded and editable

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **ONEDRIVE_QUICKSTART.md** | 5-minute setup guide for Azure |
| **ONEDRIVE_SETUP.md** | Detailed setup instructions |
| **SHARE_LINK_GUIDE.md** | How to use share links (NEW!) |
| **INTEGRATION_SUMMARY.md** | Technical overview |
| **.env.example** | Environment template |

## 🎯 Three Ways to Access Files

### 1. Share Link (Easiest) ⭐ NEW!
```
Share Link: https://1drv.ms/x/c/cd9b8bbddc064ce4/...
```
- ✅ Easiest to use
- ✅ Perfect for temporary access
- ✅ Great for sharing with others
- ✅ Automatically extracts File ID

### 2. File ID (Fastest)
```
File ID: bd5d840d-679d-fee3-dd34-579173493e7d
```
- ✅ Fastest loading
- ✅ Best for production
- ✅ Can be saved in .env

### 3. File Path (Organized)
```
File Path: Documents/metallurgical-data.xlsx
```
- ✅ Easy to remember
- ✅ Good for organized structures
- ✅ Works with folder navigation

## 🔧 Configuration

Your `.env` file is already configured:
```env
VITE_AZURE_CLIENT_ID="d596d7ef-4680-4e27-a6bd-a5380f8b06e8"
VITE_AZURE_TENANT_ID="dd7bd244-5045-45ed-9f8c-1d28c232641b"
VITE_ONEDRIVE_FILE_ID="bd5d840d-679d-fee3-dd34-579173493e7d"
VITE_ONEDRIVE_WORKSHEET_NAME="Sheet1"
```

## ✨ Features

### For Operators
- ✅ Load Excel from OneDrive (share link, File ID, or path)
- ✅ Edit data in browser
- ✅ Save changes to OneDrive
- ✅ Submit for approval
- ✅ Offline mode (local Excel)

### For Supervisors
- ✅ Review submitted data
- ✅ Edit if needed
- ✅ Approve (locks worksheet)
- ✅ Reject (unlocks for corrections)
- ✅ Export to Excel

## 🔄 Workflow

```
1. Operator gets share link → Pastes in app → Loads file
                                    ↓
2. Operator enters data → Saves to OneDrive → Submits
                                    ↓
3. Supervisor gets notification → Loads same file → Reviews
                                    ↓
4. Supervisor approves → Worksheet locked → Done! ✅
```

## 🎨 UI Updates

The OneDrive Configuration section now has:
- **Share Link** field (highlighted in blue, marked as "Easiest")
- **File ID** field (auto-populated from share link)
- **File Path** field (alternative method)
- **Worksheet Name** field
- Smart field disabling (when share link is used, others are disabled)

## 📱 Usage Example

### Scenario: Using Your Share Link

```typescript
// 1. User pastes share link
shareLink: "https://1drv.ms/x/c/cd9b8bbddc064ce4/ETC57QOscAdLkE3ooTGKaUABU7zBvuRiGPK9GGtAZO5QTw?e=b6a6X9"

// 2. App calls Microsoft Graph API
const fileId = await getFileFromSharedLink(shareLink);
// Returns: "bd5d840d-679d-fee3-dd34-579173493e7d"

// 3. App loads Excel data
const data = await loadExcelData(fileId, "Sheet1");

// 4. Data displayed in spreadsheet ✅
```

## 🛠️ Technical Details

### Share Link Decoding
```typescript
// In excelService.ts
async getFileFromSharedLink(shareUrl: string) {
  const base64Value = btoa(shareUrl);
  const encodedUrl = base64Value
    .replace(/=+$/, "")
    .replace(/\//g, "_")
    .replace(/\+/g, "-");
  
  const response = await this.client
    .api(`/shares/u!${encodedUrl}/driveItem`)
    .get();
  
  return response.id;
}
```

### Component Updates
- Added `oneDriveShareLink` state
- Updated `handleLoadFromOneDrive` to support share links
- Added share link input field with priority styling
- Updated instructions to highlight share link option

## 🔐 Security

- ✅ Share links respect OneDrive permissions
- ✅ Authentication required via Microsoft OAuth
- ✅ Tokens stored in sessionStorage
- ✅ No credentials in code
- ✅ Links can be revoked in OneDrive

## 🐛 Troubleshooting

### "Failed to load from share link"
1. Check if link is still valid in OneDrive
2. Verify you're signed in with correct account
3. Ensure you have permission to access the file

### "OneDrive Disconnected"
1. Click sign in button
2. Authenticate with Microsoft
3. Grant permissions when prompted

### File loads but data is empty
1. Check worksheet name (case-sensitive!)
2. Verify file has data in Excel Online
3. Try a different worksheet name

## 📞 Support

- **Quick Start**: See `ONEDRIVE_QUICKSTART.md`
- **Share Links**: See `SHARE_LINK_GUIDE.md`
- **Full Setup**: See `ONEDRIVE_SETUP.md`
- **Technical**: See `INTEGRATION_SUMMARY.md`

## 🎉 You're All Set!

Your application now supports:
- ✅ OneDrive share links (easiest!)
- ✅ File IDs (fastest!)
- ✅ File paths (organized!)
- ✅ Local Excel files (offline!)

Just paste your share link and start working! 🚀

---

**Next Steps:**
1. Run `npm run dev`
2. Sign in to Microsoft
3. Paste your share link
4. Start editing!
