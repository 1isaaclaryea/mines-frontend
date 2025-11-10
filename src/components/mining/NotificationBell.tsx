/**
 * Notification Bell Component
 * Displays notification icon with red dot indicator
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
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Notifications (${unacknowledgedCount} unread)`}
          >
            <Bell className="h-5 w-5" />
          </Button>
          {unacknowledgedCount > 0 && (
            <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-background" />
          )}
        </div>
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
