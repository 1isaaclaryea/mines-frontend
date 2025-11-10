/**
 * Recent Notifications Panel Component
 * Displays the 5 most recent equipment notifications on the dashboard
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Bell, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface RecentNotificationsPanelProps {
  className?: string;
}

export function RecentNotificationsPanel({ className }: RecentNotificationsPanelProps) {
  const { notifications } = useNotifications();

  // Get the 5 most recent notifications
  const recentNotifications = notifications.slice(0, 5);

  const getNotificationIcon = (status: string, severity: string) => {
    if (status === 'down') {
      return <AlertCircle className="h-4 w-4" />;
    }
    
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (status: string, severity: string) => {
    if (status === 'down') {
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
    
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'info': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSeverityBadge = (status: string, severity: string) => {
    if (status === 'down') {
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
    
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getFormattedTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return new Date(timestamp).toLocaleString();
    }
  };

  return (
    <Card className={`bg-card border-border ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-400" />
          <span>Recent Notifications ({recentNotifications.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-3">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No notifications available</p>
              </div>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 rounded-lg border ${getNotificationColor(notification.status, notification.severity)}`}
                >
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-2 flex-1">
                      {getNotificationIcon(notification.status, notification.severity)}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{notification.equipmentName}</p>
                          <Badge className={`${getSeverityBadge(notification.status, notification.severity)} border text-xs`}>
                            {notification.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{getFormattedTime(notification.timestamp)}</span>
                          {notification.acknowledged && (
                            <span className="text-green-400">✓ Acknowledged</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
