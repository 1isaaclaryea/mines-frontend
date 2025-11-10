# Notification System Migration Guide

## For Existing Users

### What's New?

The Mining Operations Analytics Platform now includes a **real-time equipment notification system** for supervisors and administrators.

### Key Features

1. **🔔 Notification Bell** - New bell icon in the header shows unacknowledged alerts
2. **⚡ Real-Time Alerts** - Instant notifications when equipment goes down or comes back up
3. **📋 Notification Panel** - View, filter, and manage all equipment alerts
4. **🔊 Alert Sounds** - Audio notification for critical equipment failures
5. **✅ Acknowledgment** - Mark notifications as acknowledged to track response

### Who Can See Notifications?

**Only supervisors and administrators** can access the notification system.

- ✅ **Supervisors**: Can view and acknowledge notifications
- ✅ **Administrators**: Can view, acknowledge, and delete notifications
- ❌ **Regular Users**: Will not see the notification bell

### Visual Changes

#### Before:
```
[Mining Operations Analytics]  [Time Range Selector]
```

#### After:
```
[Mining Operations Analytics]  [Time Range Selector] [🔔 Bell Icon]
```

### How to Use

#### 1. View Notifications
- Click the bell icon in the header
- A panel will open showing all equipment alerts

#### 2. Acknowledge Notifications
- Click the "Acknowledge" button on any notification
- This marks it as seen and reduces the badge count

#### 3. Filter Notifications
- Use tabs to filter: All / Unacknowledged / Acknowledged
- Use dropdowns to filter by status (Down/Up) or severity

#### 4. Delete Notifications (Admin Only)
- Click the trash icon on any notification
- Confirm deletion

### Understanding Alerts

#### Equipment DOWN (Critical)
- **Toast**: Red error message that stays until dismissed
- **Sound**: Alert sound plays (if enabled)
- **Badge**: Count increases
- **Action**: Investigate immediately

#### Equipment UP (Resolved)
- **Toast**: Green success message that auto-closes after 5 seconds
- **Badge**: Count increases (until acknowledged)
- **Action**: Verify equipment is operational

### Notification Details

Each notification shows:
- **Equipment Name**: e.g., "Green Lamp Conveyor"
- **Status**: DOWN (🔴) or UP (🟢)
- **Message**: Description of the event
- **Timestamp**: When the event occurred
- **Severity**: Critical, Warning, or Info
- **Acknowledged By**: Who acknowledged it (if applicable)

### Best Practices

#### For Supervisors:
1. **Check notifications regularly** - Don't rely solely on toasts
2. **Acknowledge promptly** - Let others know you're aware
3. **Investigate DOWN alerts** - Verify equipment status
4. **Don't dismiss UP alerts** - Confirm equipment is truly operational

#### For Administrators:
1. **Monitor acknowledgment patterns** - Ensure supervisors are responsive
2. **Delete outdated notifications** - Keep the list manageable
3. **Review notification history** - Identify recurring issues

### Troubleshooting

#### "I don't see the bell icon"
- **Check your role**: Only supervisors and admins see it
- **Logout and login again**: Role changes require re-authentication
- **Contact admin**: Your account may need role update

#### "Notifications aren't appearing"
- **Check your internet connection**: Real-time alerts require active connection
- **Refresh the page**: Re-establish Socket.IO connection
- **Check browser console**: Look for connection errors (F12)

#### "Badge count seems wrong"
- **Click the refresh button** in the notification panel
- **Acknowledge old notifications** to clear the count

#### "Alert sound not playing"
- **Check browser permissions**: Allow audio playback
- **Check volume**: Ensure system volume is up
- **Check sound file**: Contact admin if sound is missing

### Privacy & Data

- **Retention**: Notifications are automatically deleted after 30 days
- **Visibility**: Only supervisors and admins can see notifications
- **Acknowledgment**: Your name is recorded when you acknowledge
- **Audit Trail**: All actions are logged for accountability

### Mobile Usage

The notification system works on mobile devices:
- Bell icon is visible
- Panel adjusts to screen size
- Touch interactions supported
- All features available

### Keyboard Shortcuts

- **Tab**: Navigate through notifications
- **Enter**: Acknowledge selected notification
- **Escape**: Close notification panel

### Accessibility

- **Screen Readers**: Notifications are announced
- **High Contrast**: Color coding meets WCAG standards
- **Keyboard Navigation**: Full keyboard support

### Performance Impact

The notification system is designed for minimal performance impact:
- **Lightweight**: Uses efficient WebSocket connection
- **Optimized**: Only loads notifications when panel is opened
- **Cached**: Reduces redundant API calls

### Frequently Asked Questions

#### Q: Can I turn off notifications?
A: No, notifications are essential for supervisors and admins. However, you can mute browser sounds.

#### Q: How long do notifications stay?
A: Notifications are automatically deleted after 30 days.

#### Q: Can I see who else acknowledged a notification?
A: Yes, acknowledged notifications show who acknowledged them and when.

#### Q: What happens if I miss a notification?
A: All notifications are stored in the panel. The badge count shows unacknowledged alerts.

#### Q: Can I export notifications?
A: Not currently. This feature may be added in the future.

#### Q: Do notifications work offline?
A: No, real-time notifications require an active internet connection. However, you can view previously loaded notifications offline.

### Feedback

We value your feedback! If you encounter issues or have suggestions:
1. Document the issue (screenshots help)
2. Note the timestamp and equipment involved
3. Contact your system administrator
4. Check browser console for error messages (F12)

### Training Resources

- **NOTIFICATION_SYSTEM_README.md** - Technical documentation
- **TESTING_GUIDE.md** - Comprehensive testing procedures
- **NOTIFICATION_QUICK_REFERENCE.md** - Developer quick reference

### Support

For technical support:
1. Run diagnostics: Open browser console (F12) and type:
   ```javascript
   window.notificationTest.runDiagnostics()
   ```
2. Share the output with your system administrator

### Rollout Schedule

- **Phase 1**: Supervisors and admins (current)
- **Phase 2**: Email notifications (planned)
- **Phase 3**: SMS notifications (planned)
- **Phase 4**: Mobile app push notifications (planned)

### What Hasn't Changed

- All existing features remain the same
- Dashboard, reports, and data entry are unchanged
- User roles and permissions (except notification access)
- Data import and export functionality

### Getting Started Checklist

- [ ] Login as supervisor or admin
- [ ] Locate the bell icon in the header
- [ ] Click the bell to open the notification panel
- [ ] Review any existing notifications
- [ ] Acknowledge a notification to see how it works
- [ ] Try filtering notifications
- [ ] Familiarize yourself with the interface

### Next Steps

1. **Explore the notification panel** - Click around and get comfortable
2. **Test acknowledgment** - Acknowledge a few notifications
3. **Try filters** - Filter by status and severity
4. **Monitor regularly** - Check notifications throughout your shift
5. **Provide feedback** - Share your experience with the team

### Important Notes

- **Real-time alerts are critical** - Don't ignore them
- **Acknowledge promptly** - Let others know you're aware
- **Investigate thoroughly** - Verify equipment status before acknowledging
- **Report issues** - If notifications seem incorrect, report immediately

### Version History

- **v1.0** - Initial release with core notification features
- **Future**: Email/SMS integration, analytics, custom rules

---

**Questions?** Contact your system administrator or refer to the technical documentation.
