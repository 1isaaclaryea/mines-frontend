# Historian Authentication Fix Guide

## Problem
The application shows:
- "Failed to load historian data"
- "Please authenticate"
- "Showing mock data instead"

This occurs when the historian API endpoints return 401 (Unauthorized) errors.

## Root Cause
The historian API requires JWT authentication, but one of the following is happening:
1. No JWT token exists (user not logged in to backend)
2. JWT token is expired
3. Backend URL is misconfigured

## Solution Steps

### Step 1: Check Backend URL Configuration

1. Open your `.env` file (create it if it doesn't exist by copying `.env.example`)
2. Ensure it has the correct backend URL:

```env
# For local development
VITE_BACKEND_URL=http://localhost:5000/api

# OR for production
VITE_BACKEND_URL=https://mines-backend1-production.up.railway.app/api
```

3. **Important**: After changing `.env`, restart your dev server:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

### Step 2: Verify Backend is Running

**For Local Development:**
```bash
# Check if backend is running on port 5000
curl http://localhost:5000/api/health
# OR
curl http://localhost:5000/api/
```

**For Production:**
```bash
curl https://mines-backend1-production.up.railway.app/api/health
```

If you get connection errors, the backend is not running.

### Step 3: Check Authentication Status

1. Open browser DevTools (F12)
2. Go to **Application** tab → **Local Storage** → Select your site
3. Look for these keys:
   - `token` or `authToken` - Should contain a JWT token
   - `userData` - Should contain user information
   - `employeeId` - Should contain your employee ID

**If these don't exist**, you need to log in via the backend.

### Step 4: Login to Backend

The app has two authentication systems:
1. **Frontend-only auth** (for UI access) - Already working
2. **Backend API auth** (for historian data) - This is what's failing

To fix:

1. The `LoginPage` component should call the backend login API
2. Check if `src/components/mining/LoginPage.tsx` is calling `login()` from `apiService.ts`

Example login flow:
```typescript
import { login } from '../../services/apiService';

// In your login handler:
const response = await login(email, password);
// This stores the JWT token automatically
```

### Step 5: Verify Token is Being Sent

1. Open DevTools → **Network** tab
2. Reload the page
3. Look for requests to `/api/historian/`
4. Click on one and check **Request Headers**
5. Should see: `Authorization: Bearer <your-jwt-token>`

**If Authorization header is missing**, the token isn't being retrieved correctly.

### Step 6: Check Token Expiration

JWT tokens expire. If you see authentication working initially but failing later:

1. Check browser console for 401 errors
2. Log out and log back in to get a fresh token
3. Consider implementing token refresh logic

## Quick Diagnostic Commands

Run these in your browser console (F12 → Console):

```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// Check backend URL
console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);

// Test backend connection
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend health:', d))
  .catch(e => console.error('Backend error:', e));

// Test historian endpoint with auth
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/historian/digital?tags=FIX.CN_DOSING_PUMP.F_CV', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
  .then(r => r.json())
  .then(d => console.log('Historian response:', d))
  .catch(e => console.error('Historian error:', e));
```

## Common Issues & Solutions

### Issue 1: "VITE_BACKEND_URL is undefined"
**Solution**: 
- Ensure `.env` file exists in project root
- Restart dev server after creating/modifying `.env`
- Environment variables must start with `VITE_` to be accessible

### Issue 2: "CORS error"
**Solution**: Backend needs to allow requests from your frontend origin
```javascript
// Backend should have:
app.use(cors({
  origin: 'http://localhost:5173', // or your frontend URL
  credentials: true
}));
```

### Issue 3: "Token exists but still getting 401"
**Solution**: 
- Token might be expired - log out and log back in
- Token might be invalid - check backend logs
- Backend might not be validating tokens correctly

### Issue 4: "Backend login not implemented"
**Solution**: Check if `LoginPage.tsx` is calling the backend API:
```typescript
// Should have something like:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await login(email, password); // This calls backend
    onLogin(role, employeeId, name);
  } catch (error) {
    // Handle error
  }
};
```

## Testing the Fix

After implementing fixes:

1. **Clear browser storage**:
   ```javascript
   localStorage.clear();
   ```

2. **Reload the page**

3. **Log in** (this should call backend and store JWT)

4. **Navigate to Process Parameters**

5. **Check console** - should see:
   ```
   Fetching parameter data for tags: FIX.CN_LEVEL_.F_CV,...
   Historian response: { success: true, data: [...] }
   ```

6. **Verify UI** - should NOT show "Failed to load historian data"

## Need More Help?

If still not working:

1. Check backend logs for authentication errors
2. Verify historian server is accessible from backend
3. Check if backend has proper historian credentials configured
4. Ensure backend JWT middleware is working correctly

## Related Files

- Frontend auth: `src/services/apiService.ts`
- Login component: `src/components/mining/LoginPage.tsx`
- Process parameters: `src/components/mining/ProcessParametersPanel.tsx`
- Environment config: `.env`
- Auth config: `src/config/authConfig.ts`
