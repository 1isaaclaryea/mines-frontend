# Microsoft Graph API Permissions Guide

## Required Permissions for OneDrive Integration

### Current Configuration

The app now requests these Microsoft Graph API permissions:

```typescript
scopes: [
  "User.Read",              // Read user profile
  "Files.ReadWrite.All",    // Read/write files in OneDrive
  "Sites.Read.All"          // Access shared files via share links
]
```

### Permission Details

#### 1. **User.Read** (Required)
- **Purpose**: Read basic user profile information
- **What it allows**:
  - Get user's name, email, and profile picture
  - Verify user identity
- **Required for**: Basic authentication

#### 2. **Files.ReadWrite.All** (Required)
- **Purpose**: Read and write files in the user's OneDrive
- **What it allows**:
  - Download Excel files from OneDrive
  - Upload/update Excel files to OneDrive
  - Access files by File ID or path
- **Required for**: Loading and saving Excel data

#### 3. **Sites.Read.All** (Required for Share Links)
- **Purpose**: Access shared items via share links
- **What it allows**:
  - Decode OneDrive share links
  - Access files shared with you
  - Use the `/shares` endpoint
- **Required for**: Share link functionality
- **⚠️ This was missing and causing authentication errors!**

## Why Sites.Read.All is Needed

When you use a share link like:
```
https://1drv.ms/x/c/cd9b8bbddc064ce4/ETC57QOscAdLkE3ooTGKaUABU7zBvuRiGPK9GGtAZO5QTw
```

The app calls:
```
GET /shares/u!{encodedUrl}/driveItem
```

This endpoint requires **Sites.Read.All** permission to work.

## How to Grant Permissions

### Step 1: Clear Existing Session
1. Sign out from the app if you're signed in
2. Clear browser cache/cookies (or use incognito mode)

### Step 2: Sign In Again
1. Click "Sign in to OneDrive" in the app
2. You'll see a Microsoft consent screen
3. The consent screen will now show:
   - ✅ View your basic profile
   - ✅ Have full access to your files
   - ✅ Read items in all site collections

### Step 3: Accept Permissions
1. Click **Accept** to grant all permissions
2. You'll be redirected back to the app
3. Try loading a file with a share link

## Troubleshooting Authentication Errors

### Error: "Insufficient privileges to complete the operation"

**Cause**: Missing `Sites.Read.All` permission

**Solution**:
1. Update `authConfig.ts` (already done ✅)
2. Sign out and sign in again
3. Accept the new permissions

### Error: "AADSTS65001: The user or administrator has not consented"

**Cause**: Permissions not granted yet

**Solution**:
1. Sign out completely
2. Clear browser session storage:
   ```javascript
   // In browser console
   sessionStorage.clear();
   ```
3. Sign in again and accept permissions

### Error: "Access token validation failure"

**Cause**: Old token without new permissions

**Solution**:
1. Sign out from the app
2. Restart the dev server:
   ```bash
   npm run dev
   ```
3. Sign in again

### Error: "The requested scope is not supported"

**Cause**: Azure AD app registration doesn't have API permissions configured

**Solution** (for app administrators):
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Select your app
4. Go to **API permissions**
5. Add these Microsoft Graph permissions:
   - `User.Read` (Delegated)
   - `Files.ReadWrite.All` (Delegated)
   - `Sites.Read.All` (Delegated)
6. Click **Grant admin consent** (if you're an admin)

## Permission Scopes Comparison

| Permission | Type | Access Level | Required For |
|------------|------|--------------|--------------|
| `User.Read` | Delegated | Basic profile | Authentication |
| `Files.Read` | Delegated | Read-only files | View files only |
| `Files.ReadWrite` | Delegated | User's files only | Edit own files |
| `Files.ReadWrite.All` | Delegated | All accessible files | Full file access |
| `Sites.Read.All` | Delegated | Read shared items | **Share links** |

## Security Considerations

### What These Permissions Allow

✅ **Allowed**:
- Read/write files in YOUR OneDrive
- Access files shared WITH YOU
- Read basic profile information

❌ **NOT Allowed**:
- Access other users' private files
- Delete files without your action
- Access files you don't have permission to
- Modify permissions or sharing settings

### Best Practices

1. **Only grant to trusted apps**: These permissions give significant access
2. **Review regularly**: Check [Microsoft account permissions](https://account.microsoft.com/privacy/app-access)
3. **Revoke if unused**: You can revoke app access anytime
4. **Use personal accounts carefully**: Personal Microsoft accounts have different security models

## Testing Your Permissions

### Test 1: Basic Authentication
```typescript
// Should work with User.Read
GET /me
```

### Test 2: File Access
```typescript
// Should work with Files.ReadWrite.All
GET /me/drive/items/{fileId}/content
```

### Test 3: Share Link Access
```typescript
// Should work with Sites.Read.All
GET /shares/u!{encodedUrl}/driveItem
```

## Alternative: Minimal Permissions

If you don't need share link functionality, you can use minimal permissions:

```typescript
scopes: [
  "User.Read",
  "Files.ReadWrite.All"
]
```

Then use only:
- Direct File IDs
- File paths in your OneDrive

**Note**: Share links won't work without `Sites.Read.All`

## For Azure AD Administrators

### Configuring App Registration

1. **Navigate to App Registration**:
   - Azure Portal → Azure Active Directory → App registrations
   - Select your app (Client ID: from `.env` file)

2. **Add API Permissions**:
   - Click "API permissions" → "Add a permission"
   - Select "Microsoft Graph" → "Delegated permissions"
   - Add:
     - `User.Read`
     - `Files.ReadWrite.All`
     - `Sites.Read.All`

3. **Grant Admin Consent** (optional but recommended):
   - Click "Grant admin consent for [Organization]"
   - This pre-approves permissions for all users

4. **Configure Redirect URIs**:
   - Authentication → Platform configurations → Web
   - Add: `http://localhost:5173` (for development)
   - Add: Your production URL

### Organizational Policies

If users still can't grant permissions:
- Check if admin consent is required for your organization
- Verify the app is not blocked by conditional access policies
- Ensure the API permissions are not restricted

## Quick Fix Checklist

If you're getting authentication errors with share links:

- [ ] Updated `authConfig.ts` with `Sites.Read.All` ✅
- [ ] Signed out from the app
- [ ] Cleared browser session storage
- [ ] Restarted the dev server
- [ ] Signed in again
- [ ] Accepted all permissions in consent screen
- [ ] Tested with a share link

## Need More Help?

- [Microsoft Graph Permissions Reference](https://docs.microsoft.com/en-us/graph/permissions-reference)
- [OneDrive API Documentation](https://docs.microsoft.com/en-us/graph/api/resources/onedrive)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
