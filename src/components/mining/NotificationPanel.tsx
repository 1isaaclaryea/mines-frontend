/**
 * Notification Panel Component
 * Displays list of equipment notifications with filters
 */

import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationItem } from './NotificationItem';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Loader2, RefreshCw } from 'lucide-react';
import { GetNotificationsParams } from '../../services/notificationService';

interface NotificationPanelProps {
  onClose?: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const {
    notifications,
    unacknowledgedCount,
    loading,
    currentPage,
    totalPages,
    fetchNotifications,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unacknowledged' | 'acknowledged'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'down' | 'up'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  // Fetch notifications when filters change
  useEffect(() => {
    const params: GetNotificationsParams = {
      page: 1,
      limit: 50,
    };

    if (activeFilter === 'unacknowledged') {
      params.acknowledged = false;
    } else if (activeFilter === 'acknowledged') {
      params.acknowledged = true;
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (severityFilter !== 'all') {
      params.severity = severityFilter;
    }

    fetchNotifications(params);
  }, [activeFilter, statusFilter, severityFilter, fetchNotifications]);

  const handleRefresh = () => {
    const params: GetNotificationsParams = {
      page: currentPage,
      limit: 50,
    };

    if (activeFilter === 'unacknowledged') {
      params.acknowledged = false;
    } else if (activeFilter === 'acknowledged') {
      params.acknowledged = true;
    }

    if (statusFilter !== 'all') {
      params.status = statusFilter;
    }

    if (severityFilter !== 'all') {
      params.severity = severityFilter;
    }

    fetchNotifications(params);
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      const params: GetNotificationsParams = {
        page: currentPage + 1,
        limit: 50,
      };

      if (activeFilter === 'unacknowledged') {
        params.acknowledged = false;
      } else if (activeFilter === 'acknowledged') {
        params.acknowledged = true;
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (severityFilter !== 'all') {
        params.severity = severityFilter;
      }

      fetchNotifications(params);
    }
  };

  return (
    <div className="flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div>
          <h3 className="text-lg font-semibold">Equipment Alerts</h3>
          <p className="text-sm text-muted-foreground">
            {unacknowledgedCount} unacknowledged
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Filters */}
      <div className="p-4 border-b space-y-3 shrink-0">
        {/* Acknowledged Filter */}
        <Tabs value={activeFilter} onValueChange={(v: string) => setActiveFilter(v as 'all' | 'unacknowledged' | 'acknowledged')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unacknowledged">Unacknowledged</TabsTrigger>
            <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Status and Severity Filters */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
          >
            <option value="all">All Status</option>
            <option value="down">Down</option>
            <option value="up">Up</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
          >
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className="h-[360px]">
        <div className="p-4 space-y-2">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No notifications found</p>
            </div>
          ) : (
            <>
              {notifications.slice(0, 3).map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                />
              ))}

              {/* Load More Button */}
              {currentPage < totalPages && (
                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLoadMore}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${currentPage} of ${totalPages})`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
