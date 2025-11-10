# Equipment Notification System

## Overview
Real-time equipment notification system that receives alerts via Socket.IO when mining equipment goes down or comes back up. The system displays toast notifications and maintains a notification panel for supervisors and admins only.

## Features Implemented

### ✅ Real-time Socket.IO Connection
- Automatic connection on login for supervisors/admins
- JWT token authentication
- Auto-reconnection with exponential backoff
- Connection status monitoring
- Graceful disconnect on logout

### ✅ Toast Notifications
- **Equipment DOWN**: Red error toast that doesn't auto-close (requires manual dismiss)
- **Equipment UP**: Green success toast that auto-closes after 5 seconds
- Optional alert sound playback
- Equipment name and status message displayed

### ✅ Notification Bell Icon
- Displays in header next to time range selector
- Badge shows unacknowledged notification count
- Only visible to supervisors and admins
- Click to open notification panel

### ✅ Notification Panel
- Dropdown panel with scrollable list
- Shows equipment name, status, message, timestamp
- Color-coded by severity (critical/warning/info)
- Acknowledge button for unacknowledged notifications
- Shows who acknowledged and when
- Delete button (admin only)

### ✅ Filters
- **Acknowledged Status**: All / Unacknowledged / Acknowledged
- **Equipment Status**: All / Down / Up
- **Severity**: All / Critical / Warning / Info

### ✅ Pagination
- Load more button
- Shows current page and total pages
- Loads 50 notifications per page

### ✅ Role-Based Access Control
- Only supervisors and admins can see notifications
- Regular users don't see the notification bell
- Admin-only delete functionality

## File Structure

```
src/
├── services/
│   ├── socketService.ts          # Socket.IO connection management
│   └── notificationService.ts    # REST API calls for notifications
├── context/
│   └── NotificationContext.tsx   # State management and Socket.IO integration
├── components/
│   └── mining/
│       ├── NotificationBell.tsx  # Bell icon with badge
│       ├── NotificationPanel.tsx # Notification list with filters
│       └── NotificationItem.tsx  # Individual notification item
└── App.tsx                       # NotificationProvider integration
```

## Backend Configuration

### Environment Variables
Add to `.env` file:
```
VITE_BACKEND_URL=https://mines-backend1-production.up.railway.app/api
```

For local development:
```
VITE_BACKEND_URL=http://localhost:5000/api
```

### Socket.IO Events

#### Client → Server
- `authenticate`: Send JWT token after connection

#### Server → Client
- `authenticated`: Confirmation with user role and permissions
- `equipment-alert`: Real-time equipment status change
- `notification-acknowledged`: Someone acknowledged a notification
- `auth-error`: Authentication failed

## Usage

### 1. Login as Supervisor or Admin
Only users with `supervisor` or `admin` role will see the notification bell.

### 2. View Notifications
Click the bell icon in the header to open the notification panel.

### 3. Filter Notifications
Use the tabs and dropdowns to filter by:
- Acknowledged status
- Equipment status (down/up)
- Severity level

### 4. Acknowledge Notifications
Click the "Acknowledge" button on any unacknowledged notification.

### 5. Delete Notifications (Admin Only)
Admins can click the trash icon to delete notifications.

## API Endpoints Used

### GET /api/notifications
Get paginated list of notifications
- Query params: `page`, `limit`, `status`, `acknowledged`, `severity`, `startDate`, `endDate`

### GET /api/notifications/unacknowledged
Get count of unacknowledged notifications

### PATCH /api/notifications/:id/acknowledge
Acknowledge a notification

### DELETE /api/notifications/:id
Delete a notification (admin only)

## Socket.IO Connection Flow

1. User logs in as supervisor/admin
2. `NotificationContext` initializes
3. Socket.IO connects to backend
4. Client emits `authenticate` with JWT token
5. Server validates token and adds user to 'supervisors' room
6. Server emits `authenticated` with user data
7. Client fetches initial notifications
8. Client listens for real-time `equipment-alert` events
9. On logout, Socket.IO disconnects

## Testing

### Test Socket.IO Connection
1. Open browser console
2. Look for: `"Socket.IO connected, authenticating..."`
3. Look for: `"Socket authenticated: { userId, role, canReceiveAlerts }"`

### Test Real-time Alerts
Backend should emit `equipment-alert` events when equipment status changes.

### Test Acknowledge
1. Click "Acknowledge" button
2. Notification should update immediately
3. Badge count should decrease

### Test Filters
1. Change filter tabs/dropdowns
2. Notification list should update

## Alert Sound

Place an MP3 file at `/public/alert-sound.mp3` for alert sounds.
Current file is a placeholder - replace with actual alert sound.

## Troubleshooting

### Notification Bell Not Showing
- Check user role is 'supervisor' or 'admin'
- Check `localStorage.getItem('userRole')`
- Check browser console for errors

### Socket.IO Not Connecting
- Check `VITE_BACKEND_URL` environment variable
- Check backend is running
- Check JWT token is valid
- Check browser console for connection errors

### Notifications Not Appearing
- Check Socket.IO is connected
- Check `canReceiveAlerts` is true
- Check backend is emitting `equipment-alert` events
- Check browser console for errors

### Toast Not Showing
- Check `sonner` is installed
- Check `<Toaster />` is in App.tsx
- Check browser console for errors

## Dependencies

```json
{
  "socket.io-client": "^4.x.x",
  "sonner": "^2.0.3",
  "date-fns": "^3.x.x"
}
```

## Future Enhancements

- [ ] Browser notifications (Notification API)
- [ ] Notification sound customization
- [ ] Export notifications to CSV/PDF
- [ ] Notification search
- [ ] Bulk acknowledge
- [ ] Notification categories/tags
- [ ] Email notifications
- [ ] SMS notifications (via backend)
- [ ] Notification history analytics
- [ ] Custom notification rules

## Notes

- Notifications are auto-deleted after 30 days (backend)
- Socket.IO uses WebSocket with polling fallback
- Unacknowledged count updates in real-time
- Optimistic updates for acknowledge/delete
- TypeScript errors about `import.meta.env` are false positives (types defined in vite-env.d.ts)
