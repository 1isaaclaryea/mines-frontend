# Test Your Share Link Setup

## Quick Test Steps

### 1. Check Current Permissions

Open browser console (F12) and run:

```javascript
// Check if you're signed in
const accounts = window.msal?.getAllAccounts();
console.log('Signed in:', accounts?.length > 0);
console.log('Account:', accounts?.[0]?.username);

// Check token and scopes
if (accounts?.[0]) {
  window.msal.acquireTokenSilent({
    scopes: ["User.Read", "Files.ReadWrite.All", "Sites.Read.All"],
    account: accounts[0]
  }).then(response => {
    console.log('✅ Token acquired successfully');
    console.log('Scopes granted:', response.scopes);
    console.log('Has Sites.Read.All:', response.scopes.includes('Sites.Read.All'));
  }).catch(error => {
    console.error('❌ Token error:', error);
    console.log('Error code:', error.errorCode);
    console.log('Error message:', error.errorMessage);
  });
}
```

### 2. Test Share Link Encoding

```javascript
// Test encoding your share link
const shareUrl = "PASTE_YOUR_SHARE_LINK_HERE";
const base64Value = btoa(shareUrl);
const encodedUrl = base64Value
  .replace(/=+$/, '')
  .replace(/\//g, '_')
  .replace(/\+/g, '-');

console.log('Original URL:', shareUrl);
console.log('Encoded URL:', encodedUrl);
console.log('API endpoint:', `https://graph.microsoft.com/v1.0/shares/u!${encodedUrl}/driveItem`);
```

### 3. Manual API Test

```javascript
// Get your access token first
const accounts = window.msal?.getAllAccounts();
if (accounts?.[0]) {
  window.msal.acquireTokenSilent({
    scopes: ["User.Read", "Files.ReadWrite.All", "Sites.Read.All"],
    account: accounts[0]
  }).then(async (response) => {
    const token = response.accessToken;
    
    // Test the share link
    const shareUrl = "PASTE_YOUR_SHARE_LINK_HERE";
    const base64Value = btoa(shareUrl);
    const encodedUrl = base64Value
      .replace(/=+$/, '')
      .replace(/\//g, '_')
      .replace(/\+/g, '-');
    
    const apiResponse = await fetch(
      `https://graph.microsoft.com/v1.0/shares/u!${encodedUrl}/driveItem`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log('✅ SUCCESS! File ID:', data.id);
      console.log('File name:', data.name);
      console.log('Full response:', data);
    } else {
      const error = await apiResponse.json();
      console.error('❌ FAILED:', apiResponse.status, apiResponse.statusText);
      console.error('Error details:', error);
    }
  });
}
```

## Expected Results

### ✅ Success
```
✅ Token acquired successfully
Scopes granted: ["User.Read", "Files.ReadWrite.All", "Sites.Read.All"]
Has Sites.Read.All: true
✅ SUCCESS! File ID: 01L3LKPP4NQFKJ42UDZVEJXUM72B6WNPVO
File name: MyFile.xlsx
```

### ❌ Missing Permission
```
✅ Token acquired successfully
Scopes granted: ["User.Read", "Files.ReadWrite.All"]
Has Sites.Read.All: false
❌ FAILED: 403 Forbidden
Error details: { error: { code: "accessDenied", message: "Access denied" } }
```

**Solution**: Sign out, clear session, sign in again

### ❌ Invalid Share Link
```
❌ FAILED: 404 Not Found
Error details: { error: { code: "itemNotFound", message: "The resource could not be found" } }
```

**Solution**: Get a fresh share link from OneDrive

### ❌ Not Signed In
```
❌ Token error: InteractionRequiredAuthError
Error code: interaction_required
```

**Solution**: Sign in to the app

## Step-by-Step Troubleshooting

### If you see "Has Sites.Read.All: false"

1. **Sign out** from the app
2. **Clear session storage**:
   ```javascript
   sessionStorage.clear();
   localStorage.clear();
   ```
3. **Restart dev server**: Stop and run `npm run dev` again
4. **Sign in again** and accept ALL permissions
5. **Run test again** to verify

### If you see 403 Forbidden

This means the permission is not granted. Follow these steps:

1. Check Azure AD app registration (if you have access):
   - Go to Azure Portal
   - App registrations → Your app
   - API permissions → Verify Sites.Read.All is listed
   - Grant admin consent if needed

2. Force re-consent:
   ```javascript
   // Sign out completely
   window.msal?.logoutPopup();
   
   // Clear everything
   sessionStorage.clear();
   localStorage.clear();
   
   // Then sign in again through the app
   ```

### If you see 404 Not Found

The share link is invalid. Test it:

1. Open the share link in a new browser tab
2. It should open the file in OneDrive/Excel Online
3. If it asks you to sign in, do so
4. If it says "File not found", get a new share link

### If you see 401 Unauthorized

Token issue. Fix it:

```javascript
// Clear all auth data
sessionStorage.clear();
localStorage.clear();

// Sign out
window.msal?.logoutPopup();

// Restart the app and sign in again
```

## Create a Test File

1. Go to [OneDrive](https://onedrive.live.com)
2. Create a new Excel file named "Test.xlsx"
3. Add some data to it
4. Right-click → Share → Copy link
5. Use this link in the app
6. This ensures the file exists and you have access

## Verify Share Link Format

Your share link should look like ONE of these:

✅ **Personal OneDrive**:
```
https://1drv.ms/x/c/[RANDOM_ID]/[RANDOM_ID]?e=[RANDOM]
```

✅ **OneDrive for Business**:
```
https://[company]-my.sharepoint.com/:x:/g/personal/[user]/[RANDOM_ID]?e=[RANDOM]
```

❌ **NOT these**:
```
https://onedrive.live.com/edit.aspx?resid=...
https://onedrive.live.com/view.aspx?resid=...
https://onedrive.live.com/download?resid=...
```

## Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Has Sites.Read.All: false" | Permission not granted | Sign out, clear session, sign in again |
| 403 Forbidden | Missing permission | Grant Sites.Read.All in Azure AD |
| 404 Not Found | Invalid/expired link | Get fresh share link from OneDrive |
| 401 Unauthorized | Token expired | Sign out and sign in again |
| "msal is not defined" | Not on the app page | Run tests on localhost:5173 |

## Need More Help?

1. Run ALL the tests above
2. Copy the console output
3. Check [SHARE_LINK_DIAGNOSTICS.md](./SHARE_LINK_DIAGNOSTICS.md)
4. Check [PERMISSIONS_GUIDE.md](./PERMISSIONS_GUIDE.md)
5. Provide the error details for further assistance
