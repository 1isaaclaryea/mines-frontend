/**
 * Notification Item Component
 * Displays individual notification with acknowledge button
 */

import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Notification } from '../../services/notificationService';
import { Button } from '../ui/button';
import { Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { isAdmin } from '../../services/apiService';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { acknowledgeNotification, deleteNotification } = useNotifications();
  const userIsAdmin = isAdmin();

  const handleAcknowledge = async () => {
    await acknowledgeNotification(notification._id);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(notification._id);
    }
  };

  // Get border color based on severity
  const getBorderColor = () => {
    if (notification.status === 'down') {
      return 'border-l-red-500';
    }
    return 'border-l-green-500';
  };

  // Get background color based on severity
  const getBackgroundColor = () => {
    if (notification.status === 'down') {
      return 'bg-red-50 dark:bg-red-950/20';
    }
    return 'bg-green-50 dark:bg-green-950/20';
  };

  // Format timestamp
  const getFormattedTime = () => {
    try {
      return formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });
    } catch {
      return new Date(notification.timestamp).toLocaleString();
    }
  };

  return (
    <div
      className={`border-l-4 ${getBorderColor()} ${getBackgroundColor()} rounded-md p-3 space-y-2`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-lg">
            {notification.status === 'down' ? '🔴' : '🟢'}
          </span>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{notification.equipmentName}</h4>
            <p className="text-xs text-muted-foreground">{notification.tag}</p>
          </div>
        </div>
        {userIsAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Message */}
      <p className="text-sm">{notification.message}</p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {getFormattedTime()}
        </span>

        {notification.acknowledged ? (
          <div className="text-xs text-muted-foreground">
            {notification.acknowledgedBy && (
              <span>
                ✓ Acknowledged by {notification.acknowledgedBy.firstName}{' '}
                {notification.acknowledgedBy.lastName}
              </span>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={handleAcknowledge}
          >
            <Check className="h-3 w-3 mr-1" />
            Acknowledge
          </Button>
        )}
      </div>

      {/* Severity Badge */}
      <div className="flex gap-1">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            notification.severity === 'critical'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : notification.severity === 'warning'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}
        >
          {notification.severity.toUpperCase()}
        </span>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            notification.status === 'down'
              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}
        >
          {notification.status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
