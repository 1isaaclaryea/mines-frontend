# Equipment Notification System - Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies (already done)
npm install socket.io-client date-fns

# Start dev server
npm run dev

# Login as supervisor/admin
# Look for bell icon in header
```

## 🔧 Configuration

### Environment Variables (.env)
```env
VITE_BACKEND_URL=https://mines-backend1-production.up.railway.app/api
```

### Backend Socket.IO URL
Auto-derived from `VITE_BACKEND_URL` (removes `/api`)

## 📁 File Structure

```
src/
├── services/
│   ├── socketService.ts          # Socket.IO connection
│   └── notificationService.ts    # REST API calls
├── context/
│   └── NotificationContext.tsx   # State management
├── components/mining/
│   ├── NotificationBell.tsx      # Bell icon + badge
│   ├── NotificationPanel.tsx     # Notification list
│   └── NotificationItem.tsx      # Individual item
└── utils/
    └── notificationTestUtils.ts  # Testing utilities
```

## 🎯 Key Components

### NotificationProvider
Wrap your app:
```tsx
<NotificationProvider>
  <App />
</NotificationProvider>
```

### NotificationBell
Add to header:
```tsx
<NotificationBell />
```

### useNotifications Hook
```tsx
const {
  notifications,
  unacknowledgedCount,
  isConnected,
  canReceiveAlerts,
  fetchNotifications,
  acknowledgeNotification,
  deleteNotification,
} = useNotifications();
```

## 🔌 Socket.IO Events

### Listen For:
- `authenticated` - Auth success
- `equipment-alert` - Real-time alert
- `notification-acknowledged` - Someone acknowledged
- `auth-error` - Auth failed

### Emit:
- `authenticate` - Send JWT token

## 🌐 API Endpoints

```typescript
GET    /api/notifications                    // Get list
GET    /api/notifications/unacknowledged     // Get count
PATCH  /api/notifications/:id/acknowledge    // Acknowledge
DELETE /api/notifications/:id                // Delete (admin)
```

## 🎨 UI Components Used

- `Button` - shadcn/ui
- `Popover` - shadcn/ui
- `ScrollArea` - shadcn/ui
- `Tabs` - shadcn/ui
- `toast` - sonner

## 🔐 Role-Based Access

```typescript
// Only these roles see notifications:
- supervisor
- admin

// Check in code:
const userRole = getUserRole();
const canReceive = userRole === 'supervisor' || userRole === 'admin';
```

## 🧪 Testing Commands

```javascript
// Browser console
window.notificationTest.runDiagnostics()
window.notificationTest.logSocketStatus()
window.notificationTest.logUserAuthInfo()
```

## 🎨 Color Coding

### Status Colors:
- **DOWN**: Red (`bg-red-50`, `border-red-500`)
- **UP**: Green (`bg-green-50`, `border-green-500`)

### Severity Colors:
- **Critical**: Red
- **Warning**: Yellow
- **Info**: Blue

## 📊 Data Flow

```
1. User logs in (supervisor/admin)
2. NotificationContext initializes
3. Socket.IO connects
4. Client emits 'authenticate' with JWT
5. Server validates and adds to 'supervisors' room
6. Server emits 'authenticated'
7. Client fetches initial notifications
8. Client listens for 'equipment-alert'
9. Alert received → Toast + Update state
10. User acknowledges → API call + Socket event
```

## 🔔 Toast Behavior

### Equipment DOWN:
- ❌ Red error toast
- ❌ Does NOT auto-close
- 🔊 Plays alert sound
- 🔴 Red dot icon

### Equipment UP:
- ✅ Green success toast
- ✅ Auto-closes after 5s
- 🟢 Green dot icon

## 🐛 Debugging

### Check Connection:
```javascript
window.notificationTest.getSocketStatus()
// { isConnected: true, socketId: "...", transport: "websocket" }
```

### Check Auth:
```javascript
window.notificationTest.getUserAuthInfo()
// { token: "...", role: "supervisor", canReceiveAlerts: true }
```

### Check Logs:
Open browser console and look for:
- "Socket.IO connected, authenticating..."
- "Socket authenticated: ..."
- "Equipment alert received: ..."

## ⚡ Performance Tips

1. **Pagination**: Loads 50 notifications per page
2. **Optimistic Updates**: UI updates before API confirms
3. **Debouncing**: Filters debounced to avoid excessive API calls
4. **Memoization**: Use React.memo for NotificationItem if needed

## 🔒 Security Notes

- JWT token sent with all requests
- Socket.IO authenticates on connect
- Role-based access enforced
- Admin-only delete functionality

## 📱 Responsive Design

- Mobile: Panel adjusts width
- Tablet: Full features
- Desktop: Optimal layout

## 🎵 Alert Sound

Place MP3 file at:
```
/public/alert-sound.mp3
```

Currently a placeholder - replace with actual sound.

## 🚨 Error Handling

### Socket.IO Errors:
- Auto-reconnect (5 attempts)
- Exponential backoff
- User-friendly error messages

### API Errors:
- Toast error messages
- Optimistic updates reverted
- Console logging

## 📦 Dependencies

```json
{
  "socket.io-client": "^4.x.x",
  "sonner": "^2.0.3",
  "date-fns": "^3.x.x"
}
```

## 🎯 Common Tasks

### Add New Filter:
1. Add state in `NotificationPanel.tsx`
2. Add UI control (dropdown/tab)
3. Update `fetchNotifications` params
4. Update `useEffect` dependencies

### Customize Toast:
Edit `handleEquipmentAlert` in `NotificationContext.tsx`

### Change Pagination Limit:
Update `limit: 50` in `fetchNotifications` calls

### Add New Event:
1. Add listener in `socketService.ts`
2. Add handler in `NotificationContext.tsx`
3. Update types

## 📝 Type Definitions

```typescript
interface Notification {
  _id: string;
  tag: string;
  equipmentName: string;
  status: 'down' | 'up';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  acknowledgedAt?: string;
  createdAt: string;
}
```

## 🔗 Related Files

- `apiService.ts` - Auth helpers
- `App.tsx` - Provider integration
- `vite-env.d.ts` - Environment types

## 📞 Support

For issues:
1. Check browser console
2. Run diagnostics: `window.notificationTest.runDiagnostics()`
3. Check backend logs
4. Review TESTING_GUIDE.md

## ✅ Checklist for Production

- [ ] Replace alert sound file
- [ ] Set production backend URL
- [ ] Test with real data
- [ ] Monitor Socket.IO connections
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] User acceptance testing
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation review
