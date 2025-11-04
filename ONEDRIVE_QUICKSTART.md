# OneDrive Integration - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Azure App Registration
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations** > **New registration**
3. Name: `Mining Operations Analytics`
4. Redirect URI: `http://localhost:5173` (Single-page application)
5. Click **Register**

### Step 2: Configure Permissions
1. Go to **API permissions** > **Add a permission**
2. Select **Microsoft Graph** > **Delegated permissions**
3. Add: `User.Read` and `Files.ReadWrite.All`
4. Click **Grant admin consent**

### Step 3: Get Credentials
1. Copy **Application (client) ID**
2. Copy **Directory (tenant) ID**

### Step 4: Configure Environment
Create `.env` file in project root:
```env
VITE_AZURE_CLIENT_ID=paste-your-client-id-here
VITE_AZURE_TENANT_ID=paste-your-tenant-id-here
```

### Step 5: Run the App
```bash
npm install
npm run dev
```

## 📋 Using the Application

### Get Your OneDrive File ID

**Option A: Graph Explorer (Easiest)**
1. Go to [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Sign in
3. Run: `GET /me/drive/root/children`
4. Find your Excel file and copy the `id`

**Option B: In the App**
1. Sign in to the application
2. Enter file path: `Documents/my-data.xlsx`
3. Click "Load from OneDrive"
4. File ID will be shown automatically

### For Operators

1. **Sign In**: Click sign in button (if not already signed in)
2. **Configure OneDrive**:
   - Enter File ID: `01ABCDEF...`
   - Worksheet: `Sheet1`
3. **Load Data**: Click "Load from OneDrive"
4. **Edit**: Make changes in the spreadsheet
5. **Save**: Click "Save to OneDrive" (optional, auto-saves on submit)
6. **Submit**: Click "Submit Data" for approval

### For Supervisors

1. **Load Data**: Enter File ID and click "Load from OneDrive"
2. **Review**: Check the data for accuracy
3. **Edit**: Make corrections if needed
4. **Approve**: Click "Approve" to lock the worksheet
   - OR **Reject**: Click "Reject" to unlock for corrections

## 🎯 Key Features

### ✅ What Works
- Load Excel files from OneDrive
- Edit data in browser
- Save changes back to OneDrive
- Approval workflow with worksheet locking
- Offline mode (local Excel upload/download)
- Real-time connection status

### 🔄 Workflow
```
Operator enters data → Saves to OneDrive → Submits for approval
                                                ↓
Supervisor reviews ← Loads from OneDrive ← Notification
        ↓
Approves (locks worksheet) OR Rejects (unlocks for corrections)
```

## 🛠️ Troubleshooting

### "OneDrive Disconnected"
**Fix**: Click sign in button and authenticate with Microsoft

### "Failed to load Excel data"
**Check**:
- File ID is correct (no spaces or extra characters)
- File exists in your OneDrive
- Worksheet name matches exactly (case-sensitive)
- You have permission to access the file

### "Failed to save data"
**Check**:
- You have write permissions
- Worksheet is not protected/locked
- File is not open in Excel desktop app

### CORS Errors
**Fix**: Ensure redirect URI in Azure matches exactly:
- Development: `http://localhost:5173`
- Production: `https://your-domain.com`

## 📁 File Structure Example

### Recommended OneDrive Folder Structure
```
OneDrive/
└── Mining Operations/
    ├── CIL/
    │   ├── 2025-01-27-cil-data.xlsx
    │   └── 2025-01-28-cil-data.xlsx
    ├── Crushing/
    │   └── 2025-01-27-crushing-data.xlsx
    └── SAG/
        └── 2025-01-27-sag-data.xlsx
```

### Excel File Template
Create an Excel file with these columns:

| TIME  | SOLN Au (ppm) | % SOLIDS | pH   | CN CONC (ppm) | DO (mg/L) | CAR CONC (g/L) |
|-------|---------------|----------|------|---------------|-----------|----------------|
| 06:00 |               |          |      |               |           |                |
| 07:00 |               |          |      |               |           |                |
| 08:00 |               |          |      |               |           |                |

## 🔐 Security Tips

1. ✅ Never commit `.env` file
2. ✅ Use environment variables for credentials
3. ✅ Enable MFA on Microsoft accounts
4. ✅ Review Azure AD sign-in logs regularly
5. ✅ Grant minimum required permissions

## 📞 Need Help?

1. Check `ONEDRIVE_SETUP.md` for detailed setup
2. Check `INTEGRATION_SUMMARY.md` for technical details
3. Review Microsoft Graph API docs
4. Contact your Azure administrator

## 🎉 You're Ready!

The application is now configured for OneDrive integration. Users can:
- Load and edit Excel files from OneDrive
- Collaborate in real-time
- Approve/reject data with workflow
- Work offline when needed

Happy data entry! 📊
