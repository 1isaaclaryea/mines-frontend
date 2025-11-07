# Quick Fix: Historian Authentication Error

## The Error
```
❌ Failed to load historian data
❌ Please authenticate
⚠️ Showing mock data instead
```

## Quick Fix (3 Steps)

### Step 1: Check Backend URL
Create/edit `.env` file in project root:
```env
VITE_BACKEND_URL=http://localhost:5000/api
```

### Step 2: Restart Dev Server
```bash
# Press Ctrl+C to stop
npm run dev
```

### Step 3: Check Status
Look at the **System Status** panel (right side of Process Parameters page):
- Backend API: Should show "Online" (green)
- Authentication: Should show "Active" (green)
- Historian Data: Should show "Available" (green)

## Still Not Working?

### Is Backend Running?
```bash
# Test backend connection
curl http://localhost:5000/api/health
```

### Do You Have a Token?
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Look for `token` key
4. If missing → **Log out and log back in**

### Check Console
Open DevTools (F12) → Console tab
Look for:
- ✅ "Historian response: { success: true, data: [...] }"
- ❌ "Error fetching parameter data: Authentication required"

## Production Backend
If using production backend:
```env
VITE_BACKEND_URL=https://mines-backend1-production.up.railway.app/api
```

## Need More Help?
See `HISTORIAN_AUTH_FIX.md` for detailed troubleshooting.
