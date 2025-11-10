# Equipment Notification System - Testing Guide

## Prerequisites

1. **Backend Running**: Ensure backend is running at `https://mines-backend1-production.up.railway.app` or `http://localhost:5000`
2. **User Account**: Have a supervisor or admin account ready
3. **Browser**: Chrome, Firefox, or Edge with DevTools

## Quick Start Testing

### 1. Start the Application

```bash
npm run dev
```

### 2. Login as Supervisor/Admin

- Use credentials with role: `supervisor` or `admin`
- Regular users will NOT see notification features

### 3. Open Browser Console

Press `F12` or right-click → Inspect → Console

### 4. Run Diagnostics

In the browser console, run:

```javascript
window.notificationTest.runDiagnostics()
```

Expected output:
```
✅ Authentication token present
✅ User has alert permissions
✅ Socket.IO connected
   Socket ID: abc123xyz
   Transport: websocket
```

## Detailed Testing Steps

### Test 1: Socket.IO Connection

**Steps:**
1. Login as supervisor/admin
2. Open browser console
3. Look for these messages:
   ```
   Connecting to Socket.IO server: https://...
   Socket.IO connected, authenticating...
   Socket.IO authenticated: { userId, role, canReceiveAlerts: true }
   ```

**Expected Result:**
- ✅ Socket connects successfully
- ✅ Authentication succeeds
- ✅ `canReceiveAlerts` is `true`

**Troubleshooting:**
- If connection fails, check backend URL in `.env`
- If auth fails, check JWT token validity
- Run: `window.notificationTest.logSocketStatus()`

---

### Test 2: Notification Bell Visibility

**Steps:**
1. Login as supervisor/admin
2. Look at the header (top-right area)
3. Find the bell icon next to the time range selector

**Expected Result:**
- ✅ Bell icon is visible
- ✅ Badge shows count (may be 0)

**Test with Regular User:**
1. Logout
2. Login as regular user (non-supervisor/admin)
3. Bell icon should NOT be visible

---

### Test 3: Fetch Initial Notifications

**Steps:**
1. Login as supervisor/admin
2. Wait for Socket.IO to connect
3. Open browser console
4. Check Network tab for API call to `/api/notifications`

**Expected Result:**
- ✅ API call to `/api/notifications?page=1&limit=50`
- ✅ Response with notifications array
- ✅ Badge count updates

**Manual Check:**
```javascript
// In console
window.notificationTest.getUserAuthInfo()
```

---

### Test 4: Real-Time Equipment Alert (DOWN)

**Backend Action Required:**
Backend needs to emit an `equipment-alert` event with status `"down"`.

**Expected Frontend Behavior:**
1. ✅ Red error toast appears (top-right)
2. ✅ Toast shows equipment name and message
3. ✅ Toast has red dot (🔴) icon
4. ✅ Toast does NOT auto-close
5. ✅ Alert sound plays (if sound file exists)
6. ✅ Badge count increases by 1
7. ✅ Notification appears in panel

**Toast Example:**
```
┌─────────────────────────────────┐
│ 🔴 Green Lamp Conveyor          │
│ Green Lamp Conveyor is DOWN     │
│                        [Dismiss] │
└─────────────────────────────────┘
```

---

### Test 5: Real-Time Equipment Alert (UP)

**Backend Action Required:**
Backend needs to emit an `equipment-alert` event with status `"up"`.

**Expected Frontend Behavior:**
1. ✅ Green success toast appears
2. ✅ Toast shows equipment name and message
3. ✅ Toast has green dot (🟢) icon
4. ✅ Toast auto-closes after 5 seconds
5. ✅ Badge count increases by 1 (if unacknowledged)
6. ✅ Notification appears in panel

---

### Test 6: Notification Panel

**Steps:**
1. Click the bell icon
2. Panel should open below the bell

**Expected Result:**
- ✅ Panel opens (400px wide, 600px tall)
- ✅ Header shows "Equipment Alerts"
- ✅ Shows unacknowledged count
- ✅ Refresh button visible
- ✅ Filter tabs visible
- ✅ Notifications list visible

---

### Test 7: Notification Item Display

**Check each notification item shows:**
- ✅ Status icon (🔴 for down, 🟢 for up)
- ✅ Equipment name (bold)
- ✅ Equipment tag (small text)
- ✅ Message text
- ✅ Timestamp (e.g., "2 minutes ago")
- ✅ Severity badge (CRITICAL/WARNING/INFO)
- ✅ Status badge (DOWN/UP)
- ✅ Acknowledge button (if not acknowledged)
- ✅ Acknowledged by info (if acknowledged)
- ✅ Delete button (admin only)

**Color Coding:**
- DOWN: Red border and background
- UP: Green border and background

---

### Test 8: Acknowledge Notification

**Steps:**
1. Find an unacknowledged notification
2. Click "Acknowledge" button

**Expected Result:**
- ✅ Button changes to "✓ Acknowledged by [Your Name]"
- ✅ Badge count decreases by 1
- ✅ Success toast: "Notification acknowledged"
- ✅ Notification updates in real-time

**Check Backend:**
- API call to `PATCH /api/notifications/:id/acknowledge`
- Response includes `acknowledgedBy` data

---

### Test 9: Filter by Acknowledged Status

**Steps:**
1. Open notification panel
2. Click tabs: All / Unacknowledged / Acknowledged

**Expected Result:**
- ✅ "All": Shows all notifications
- ✅ "Unacknowledged": Shows only unacknowledged
- ✅ "Acknowledged": Shows only acknowledged
- ✅ List updates immediately

---

### Test 10: Filter by Status

**Steps:**
1. Open notification panel
2. Use "Status" dropdown
3. Select: All / Down / Up

**Expected Result:**
- ✅ "All": Shows all statuses
- ✅ "Down": Shows only DOWN equipment
- ✅ "Up": Shows only UP equipment
- ✅ List updates immediately

---

### Test 11: Filter by Severity

**Steps:**
1. Open notification panel
2. Use "Severity" dropdown
3. Select: All / Critical / Warning / Info

**Expected Result:**
- ✅ Filters work correctly
- ✅ List updates immediately

---

### Test 12: Pagination

**Steps:**
1. Open notification panel
2. Scroll to bottom
3. If more than 50 notifications exist, "Load More" button appears
4. Click "Load More"

**Expected Result:**
- ✅ Button shows "(1 of 3)" format
- ✅ Clicking loads next page
- ✅ New notifications append to list
- ✅ Button updates to "(2 of 3)"

---

### Test 13: Delete Notification (Admin Only)

**Steps:**
1. Login as admin
2. Open notification panel
3. Find trash icon on notification item
4. Click trash icon
5. Confirm deletion

**Expected Result:**
- ✅ Trash icon visible (admin only)
- ✅ Confirmation dialog appears
- ✅ Notification removed from list
- ✅ Badge count updates
- ✅ Success toast: "Notification deleted"

**Test with Supervisor:**
- ✅ Trash icon should NOT be visible

---

### Test 14: Real-Time Acknowledged Event

**Backend Action Required:**
Another user acknowledges a notification.

**Expected Frontend Behavior:**
1. ✅ Notification updates in real-time
2. ✅ Shows "✓ Acknowledged by [Other User]"
3. ✅ Badge count decreases
4. ✅ No toast notification

---

### Test 15: Refresh Notifications

**Steps:**
1. Open notification panel
2. Click refresh button (circular arrow)

**Expected Result:**
- ✅ Button shows spinning animation
- ✅ API call to `/api/notifications`
- ✅ List updates with latest data
- ✅ Animation stops

---

### Test 16: Socket.IO Reconnection

**Steps:**
1. Login and connect
2. Stop backend server
3. Wait 5 seconds
4. Start backend server

**Expected Result:**
- ✅ Console shows: "Socket.IO disconnected"
- ✅ Console shows: "Socket.IO reconnection attempt 1..."
- ✅ Console shows: "Socket.IO reconnected after X attempts"
- ✅ Notifications continue working

---

### Test 17: Logout and Disconnect

**Steps:**
1. Login and connect
2. Logout

**Expected Result:**
- ✅ Console shows: "Cleaning up Socket.IO connection"
- ✅ Console shows: "Disconnecting Socket.IO..."
- ✅ Socket disconnects cleanly
- ✅ No errors in console

---

### Test 18: Multiple Filters Combined

**Steps:**
1. Set "Unacknowledged" tab
2. Set "Down" status
3. Set "Critical" severity

**Expected Result:**
- ✅ Shows only unacknowledged, down, critical notifications
- ✅ All filters apply correctly

---

### Test 19: Empty State

**Steps:**
1. Apply filters that return no results

**Expected Result:**
- ✅ Shows "No notifications found" message
- ✅ No errors in console

---

### Test 20: Mobile Responsive

**Steps:**
1. Open DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on mobile viewport

**Expected Result:**
- ✅ Bell icon visible
- ✅ Panel adjusts to screen size
- ✅ Filters stack vertically
- ✅ Touch interactions work

---

## Console Commands Reference

```javascript
// Run full diagnostics
window.notificationTest.runDiagnostics()

// Check Socket.IO status
window.notificationTest.logSocketStatus()

// Check user auth info
window.notificationTest.logUserAuthInfo()

// Check if user can receive alerts
window.notificationTest.canUserReceiveAlerts()

// Get Socket.IO connection details
window.notificationTest.getSocketStatus()

// Create mock notification (for testing)
window.notificationTest.createMockNotification('down')
```

## Common Issues and Solutions

### Issue: Bell Icon Not Showing

**Solution:**
1. Check user role: `localStorage.getItem('userRole')`
2. Must be `'supervisor'` or `'admin'`
3. Logout and login again if role changed

### Issue: Socket.IO Not Connecting

**Solution:**
1. Check backend URL: `import.meta.env.VITE_BACKEND_URL`
2. Check backend is running
3. Check JWT token: `localStorage.getItem('token')`
4. Check console for error messages

### Issue: Notifications Not Appearing

**Solution:**
1. Run: `window.notificationTest.runDiagnostics()`
2. Check all systems are ✅
3. Check backend is emitting events
4. Check browser console for errors

### Issue: Toast Not Showing

**Solution:**
1. Check `<Toaster />` is in App.tsx
2. Check `sonner` is installed
3. Check browser console for errors

### Issue: Badge Count Wrong

**Solution:**
1. Click refresh button in panel
2. Check API response in Network tab
3. Check `/api/notifications/unacknowledged` endpoint

## Performance Testing

### Load Test: 100+ Notifications

1. Create 100+ notifications in backend
2. Open notification panel
3. Check performance

**Expected:**
- ✅ Panel loads smoothly
- ✅ Scrolling is smooth
- ✅ Pagination works
- ✅ No memory leaks

### Stress Test: Rapid Alerts

1. Backend emits 10 alerts in 1 second
2. Check frontend handles gracefully

**Expected:**
- ✅ All toasts appear
- ✅ Badge count accurate
- ✅ No crashes
- ✅ No duplicate notifications

## Accessibility Testing

1. **Keyboard Navigation:**
   - Tab through notification panel
   - Press Enter to acknowledge
   - Press Escape to close panel

2. **Screen Reader:**
   - Bell icon has aria-label
   - Notifications are announced

3. **Color Contrast:**
   - Red/green colors have sufficient contrast
   - Dark mode support

## Security Testing

1. **JWT Token:**
   - Expired token should disconnect Socket.IO
   - Invalid token should show auth error

2. **Role-Based Access:**
   - Regular users can't see notifications
   - Only admins can delete

3. **XSS Protection:**
   - Equipment names with HTML don't execute

## Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)

## Success Criteria

All tests pass:
- ✅ Socket.IO connects and authenticates
- ✅ Real-time alerts appear as toasts
- ✅ Notification panel displays correctly
- ✅ Filters work
- ✅ Acknowledge works
- ✅ Delete works (admin)
- ✅ Badge count accurate
- ✅ Pagination works
- ✅ Reconnection works
- ✅ Role-based access enforced

## Next Steps

After testing:
1. Replace `/public/alert-sound.mp3` with actual sound
2. Configure production backend URL
3. Test with real equipment data
4. Monitor performance in production
5. Gather user feedback
