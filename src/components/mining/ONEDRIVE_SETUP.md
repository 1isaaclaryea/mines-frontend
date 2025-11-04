# OneDrive Integration Setup Guide

## Overview
This guide will help you set up Microsoft Graph API integration for OneDrive Excel file access in the Mining Operations Analytics Platform.

## Prerequisites
- Azure subscription
- Microsoft 365 account with OneDrive access
- Node.js and npm installed

## Step 1: Azure AD App Registration

### 1.1 Create App Registration
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: Mining Operations Analytics
   - **Supported account types**: Accounts in this organizational directory only (Single tenant)
   - **Redirect URI**: 
     - Platform: Single-page application (SPA)
     - URI: `http://localhost:5173` (for development)
5. Click **Register**

### 1.2 Configure API Permissions
1. In your app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph** > **Delegated permissions**
4. Add the following permissions:
   - `User.Read`
   - `Files.ReadWrite.All`
5. Click **Add permissions**
6. Click **Grant admin consent** (if you have admin rights)

### 1.3 Get Your Credentials
1. Go to **Overview** tab
2. Copy the following values:
   - **Application (client) ID**
   - **Directory (tenant) ID**

## Step 2: Environment Configuration

### 2.1 Create .env File
Create a `.env` file in the root of your project:

```bash
# Copy from .env.example
cp .env.example .env
```

### 2.2 Update .env File
```env
# Azure AD / Microsoft Entra ID Configuration
VITE_AZURE_CLIENT_ID=your-application-client-id-here
VITE_AZURE_TENANT_ID=your-directory-tenant-id-here

# OneDrive Excel File Configuration (Optional)
VITE_ONEDRIVE_FILE_ID=your-file-id-here
VITE_ONEDRIVE_WORKSHEET_NAME=Sheet1
```

## Step 3: Get OneDrive File ID

### Method 1: Using Graph Explorer
1. Go to [Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Sign in with your Microsoft account
3. Run this query:
   ```
   GET https://graph.microsoft.com/v1.0/me/drive/root/children
   ```
4. Find your Excel file in the response and copy its `id`

### Method 2: Using File Path in the App
1. Sign in to the application
2. In the OneDrive Configuration section, enter the file path:
   - Example: `Documents/metallurgical-data.xlsx`
3. Click "Load from OneDrive"
4. The File ID will be automatically retrieved and displayed

### Method 3: From OneDrive Share Link
If you have a share link, you can use the `getFileFromSharedLink` method in the Excel service.

## Step 4: Prepare Your Excel File

### 4.1 File Structure
Create an Excel file with the following structure for CIL Plant Monitoring:

| TIME  | SOLN Au (ppm) | % SOLIDS | pH   | CN CONC (ppm) | DO (mg/L) | CAR CONC (g/L) |
|-------|---------------|----------|------|---------------|-----------|----------------|
| 06:00 |               |          |      |               |           |                |
| 07:00 |               |          |      |               |           |                |
| ...   |               |          |      |               |           |                |

### 4.2 Upload to OneDrive
1. Upload the Excel file to your OneDrive
2. Note the file path or get the File ID using one of the methods above

## Step 5: Using the Application

### 5.1 Sign In
1. Start the development server: `npm run dev`
2. Navigate to the application
3. You should see "OneDrive Connected" badge if signed in to Microsoft

### 5.2 Load Data from OneDrive
1. Enter the **File ID** or **File Path**
2. Enter the **Worksheet Name** (default: Sheet1)
3. Click **Load from OneDrive**
4. The Excel data will be loaded into the spreadsheet

### 5.3 Edit and Save Data
1. Make changes in the spreadsheet
2. Click **Save to OneDrive** to sync changes
3. Submit data for approval

### 5.4 Supervisor Approval
1. Supervisors can review the data
2. Click **Approve** to:
   - Add "Approved" status to the Excel file
   - Lock the worksheet to prevent further edits
3. Click **Reject** to:
   - Add "Rejected" status
   - Unlock the worksheet for corrections

## Step 6: Production Deployment

### 6.1 Update Redirect URI
1. Go back to Azure Portal > App registrations
2. Add production redirect URI:
   - Platform: Single-page application (SPA)
   - URI: `https://your-production-domain.com`

### 6.2 Update Environment Variables
Update your production environment variables with the same Azure credentials.

## Features

### ✅ Implemented
- Microsoft authentication (MSAL)
- Load Excel files from OneDrive
- Save changes to OneDrive
- Real-time collaboration support
- Approval workflow with worksheet locking
- Offline mode with local Excel upload/download

### 🔄 Future Enhancements
- Automatic sync with OneDrive
- Conflict resolution for concurrent edits
- Version history
- Audit trail with change tracking
- Email notifications for approvals
- Mobile app support

## Troubleshooting

### Issue: "Failed to authenticate with Microsoft"
**Solution**: 
- Check that your Client ID and Tenant ID are correct
- Ensure API permissions are granted
- Clear browser cache and try again

### Issue: "Failed to load Excel data from OneDrive"
**Solution**:
- Verify the File ID or File Path is correct
- Check that the file exists in OneDrive
- Ensure you have read permissions for the file
- Verify the worksheet name matches exactly

### Issue: "Failed to save data to OneDrive"
**Solution**:
- Check that you have write permissions
- Ensure the worksheet is not protected
- Verify the file is not open in Excel desktop app

### Issue: "CORS errors"
**Solution**:
- MSAL and Microsoft Graph API handle CORS automatically
- Ensure you're using the correct redirect URI
- Check that your app registration is configured correctly

## Security Best Practices

1. **Never commit .env file** - Add it to .gitignore
2. **Use environment variables** - Don't hardcode credentials
3. **Limit permissions** - Only request necessary Graph API scopes
4. **Enable MFA** - Require multi-factor authentication for users
5. **Monitor access** - Review Azure AD sign-in logs regularly
6. **Rotate secrets** - If using client secrets, rotate them regularly

## API Rate Limits

Microsoft Graph API has rate limits:
- **Per-user limit**: 2000 requests per second
- **Per-app limit**: 10000 requests per second

For high-volume scenarios, implement:
- Request batching
- Caching strategies
- Exponential backoff for retries

## Support

For issues or questions:
1. Check [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/)
2. Review [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
3. Contact your Azure administrator
