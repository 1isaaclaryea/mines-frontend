# Login Troubleshooting Guide

## ❌ Error: "Failed to fetch"

This error means the frontend cannot connect to the backend API.

### ✅ Quick Fixes

#### 1. Check Backend URL
The app now uses: `https://mines-backend1-production.up.railway.app/api`

**Verify it's accessible:**
```bash
# Open in browser or use curl:
curl https://mines-backend1-production.up.railway.app/api/login
```

If you get a response (even an error), the backend is reachable.

#### 2. Create Demo Users in Backend

The demo credentials shown on the login page need to exist in your database. Run these commands:

**Option A: Using the backend API directly**
```bash
# Admin User
curl -X POST https://mines-backend1-production.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "employeeId": "EMP001",
    "role": "admin",
    "email": "admin@mining.com",
    "password": "mining123",
    "phoneNumber": "1234567890",
    "isAdmin": true
  }'

# Operator User
curl -X POST https://mines-backend1-production.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Operator User",
    "employeeId": "EMP002",
    "role": "operator",
    "email": "operator@mining.com",
    "password": "ops456",
    "phoneNumber": "1234567891",
    "section": "cil"
  }'

# Supervisor User
curl -X POST https://mines-backend1-production.up.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Supervisor User",
    "employeeId": "EMP003",
    "role": "supervisor",
    "email": "supervisor@mining.com",
    "password": "super789",
    "phoneNumber": "1234567892",
    "section": "cil"
  }'
```

**Option B: Using Postman**
1. Open Postman
2. Create POST request to `https://mines-backend1-production.up.railway.app/api/users`
3. Set Headers: `Content-Type: application/json`
4. Set Body (raw JSON) with the user data above
5. Send request for each user

#### 3. Test Login Directly

Test if login works with curl:
```bash
curl -X POST https://mines-backend1-production.up.railway.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@mining.com", "password": "mining123"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Admin User",
    "employeeId": "EMP001",
    "role": "admin",
    "email": "admin@mining.com"
  }
}
```

**If you get "Invalid credentials":**
- The user doesn't exist in the database
- Password is incorrect
- Email is wrong

#### 4. Check Browser Console

Open browser DevTools (F12) and check:

**Console Tab:**
- Look for CORS errors
- Look for network errors
- Check the actual error message

**Network Tab:**
- Find the failed `/login` request
- Check the Status (should be 200, not 0 or failed)
- Check Response tab for error details
- Check Headers tab to verify request was sent

#### 5. Common Issues

**Issue: "CORS policy blocked"**
- Backend needs to allow your frontend origin
- Check backend CORS config includes `http://localhost:5173`

**Issue: "net::ERR_CONNECTION_REFUSED"**
- Backend is not running
- Wrong URL in API_BASE_URL

**Issue: "401 Unauthorized"**
- User credentials are wrong
- User doesn't exist in database

**Issue: "500 Internal Server Error"**
- Backend error (check backend logs)
- Database connection issue

## 🔍 Debug Steps

### Step 1: Verify Backend is Running
```bash
curl https://mines-backend1-production.up.railway.app/api/users
# Should return 401 (needs auth) - means backend is working
```

### Step 2: Check if Users Exist
You need access to the MongoDB database to verify users exist.

### Step 3: Test Login with Known User
If you have existing users in the database, try logging in with those credentials instead of the demo ones.

### Step 4: Check Frontend Configuration
```typescript
// In apiService.ts, verify:
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

// In .env, verify:
VITE_BACKEND_URL="https://mines-backend1-production.up.railway.app/api"
```

### Step 5: Restart Dev Server
After changing .env:
```bash
# Stop the dev server (Ctrl+C)
# Start again
npm run dev
```

## 🎯 Most Likely Solution

**You need to create the demo users in your backend database.**

The login page shows demo credentials, but these users don't exist yet. Use the curl commands above to create them, or use an existing user's credentials if you have any.

## 📝 Alternative: Use Local Backend

If you want to use a local backend instead:

1. **Start local backend:**
   ```bash
   cd C:\Users\Isaac\Documents\angular\mines\backend1
   npm start
   ```

2. **Update .env:**
   ```
   VITE_BACKEND_URL="http://localhost:5000/api"
   ```

3. **Restart frontend:**
   ```bash
   npm run dev
   ```

4. **Create users in local database** using the curl commands above (change URL to localhost:5000)

## ✅ Verification

Once users are created, you should be able to:
1. Select a role (credentials auto-fill)
2. Click "Sign In"
3. See success and be redirected to the appropriate page
4. Check localStorage for `token` key

If you still get errors, check the browser console and network tab for specific error messages.
