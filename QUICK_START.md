# Quick Start Guide - Backend Authentication

## 🚀 Get Started in 3 Steps

### Step 1: Create Backend Users

Run these commands in your backend to create demo users:

```bash
# Using curl or Postman, POST to your backend:
POST https://mines-backend1-production.up.railway.app/api/users

# Admin User
{
  "name": "Admin User",
  "employeeId": "EMP001",
  "role": "admin",
  "email": "admin@mining.com",
  "password": "mining123",
  "phoneNumber": "1234567890"
}

# Operator User
{
  "name": "Operator User",
  "employeeId": "EMP002",
  "role": "operator",
  "email": "operator@mining.com",
  "password": "ops456",
  "phoneNumber": "1234567891"
}

# Supervisor User
{
  "name": "Supervisor User",
  "employeeId": "EMP003",
  "role": "supervisor",
  "email": "supervisor@mining.com",
  "password": "super789",
  "phoneNumber": "1234567892"
}
```

### Step 2: Start the Application

```bash
# In the frontend directory
npm run dev
```

### Step 3: Test Login & Data Submission

1. **Login**: Use any of the demo credentials (they auto-fill when you select a role)
2. **Submit Data**: 
   - Go to Data Entry tab
   - Sign in to Microsoft for OneDrive
   - Enter data and click Submit
   - Data now goes to backend with JWT authentication! ✅

## ✅ What's Fixed

- ✅ JWT token authentication implemented
- ✅ Login calls backend API
- ✅ Token stored in localStorage
- ✅ All API requests include Authorization header
- ✅ Real employeeId from backend user
- ✅ Data submission now works with authentication
- ✅ Logout clears tokens properly

## 🔍 Verify It's Working

**Check localStorage after login:**
```javascript
// Open browser console:
localStorage.getItem('authToken')  // Should show JWT token
localStorage.getItem('userData')   // Should show user object
```

**Check Network tab when submitting data:**
- Look for POST to `/api/data-entry`
- Check Request Headers for: `Authorization: Bearer <token>`
- Response should be 200 OK (not 401)

## 📚 Full Documentation

- `AUTHENTICATION_SETUP.md` - Complete implementation details
- `BACKEND_INTEGRATION.md` - Data submission flow details
