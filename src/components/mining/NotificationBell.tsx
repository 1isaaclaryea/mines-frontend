/**
 * Notification Bell Component
 * Displays notification icon with badge count
 */

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationPanel } from './NotificationPanel';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

export const NotificationBell: React.FC = () => {
  const { unacknowledgedCount, canReceiveAlerts } = useNotifications();
  const [open, setOpen] = useState(false);

  // Don't render if user can't receive alerts
  if (!canReceiveAlerts) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications (${unacknowledgedCount} unread)`}
        >
          <Bell className="h-5 w-5" />
          {unacknowledgedCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unacknowledgedCount > 99 ? '99+' : unacknowledgedCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0" 
        align="end"
        sideOffset={8}
      >
        <NotificationPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
};
