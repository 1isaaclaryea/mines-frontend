/**
 * Notification Context
 * Manages notification state and Socket.IO connection
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import socketService, { EquipmentAlert, NotificationAcknowledged, AuthenticatedData } from '../services/socketService';
import {
  getNotifications,
  getUnacknowledgedCount,
  acknowledgeNotification as apiAcknowledgeNotification,
  deleteNotification as apiDeleteNotification,
  Notification,
  GetNotificationsParams,
} from '../services/notificationService';
import { toast } from 'sonner';
import { getUserRole } from '../services/apiService';

interface NotificationContextType {
  notifications: Notification[];
  unacknowledgedCount: number;
  isConnected: boolean;
  canReceiveAlerts: boolean;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  fetchNotifications: (params?: GetNotificationsParams) => Promise<void>;
  acknowledgeNotification: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshUnacknowledgedCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unacknowledgedCount, setUnacknowledgedCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [canReceiveAlerts, setCanReceiveAlerts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = useCallback(async (params: GetNotificationsParams = {}) => {
    setLoading(true);
    try {
      const response = await getNotifications({
        page: params.page || 1,
        limit: params.limit || 50,
        ...params,
      });

      setNotifications(response.notifications);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalCount(response.totalCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh unacknowledged count
   */
  const refreshUnacknowledgedCount = useCallback(async () => {
    try {
      const response = await getUnacknowledgedCount();
      setUnacknowledgedCount(response.count);
    } catch (error) {
      console.error('Error fetching unacknowledged count:', error);
    }
  }, []);

  /**
   * Acknowledge a notification
   */
  const acknowledgeNotification = useCallback(async (id: string) => {
    try {
      // Optimistic update
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, acknowledged: true } : notif
        )
      );
      setUnacknowledgedCount((prev) => Math.max(0, prev - 1));

      await apiAcknowledgeNotification(id);
      toast.success('Notification acknowledged');
    } catch (error) {
      console.error('Error acknowledging notification:', error);
      toast.error('Failed to acknowledge notification');
      
      // Revert optimistic update
      await fetchNotifications();
      await refreshUnacknowledgedCount();
    }
  }, [fetchNotifications, refreshUnacknowledgedCount]);

  /**
   * Delete a notification (admin only)
   */
  const deleteNotification = useCallback(async (id: string) => {
    try {
      // Optimistic update
      const notificationToDelete = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      
      if (notificationToDelete && !notificationToDelete.acknowledged) {
        setUnacknowledgedCount((prev) => Math.max(0, prev - 1));
      }

      await apiDeleteNotification(id);
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
      
      // Revert optimistic update
      await fetchNotifications();
      await refreshUnacknowledgedCount();
    }
  }, [notifications, fetchNotifications, refreshUnacknowledgedCount]);

  /**
   * Handle equipment alert from Socket.IO
   */
  const handleEquipmentAlert = useCallback((alert: EquipmentAlert) => {
    console.log('Equipment alert received:', alert);

    // Add to notifications list
    const newNotification: Notification = {
      _id: alert.id,
      tag: alert.tag,
      equipmentName: alert.equipmentName,
      status: alert.status,
      severity: alert.severity,
      message: alert.message,
      timestamp: alert.timestamp,
      acknowledged: alert.acknowledged,
      createdAt: alert.timestamp,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    // Increment unacknowledged count
    if (!alert.acknowledged) {
      setUnacknowledgedCount((prev) => prev + 1);
    }

    // Show toast notification
    if (alert.status === 'down') {
      // Critical alert - doesn't auto-close
      toast.error(
        <div className="flex flex-col gap-1">
          <div className="font-semibold flex items-center gap-2">
            <span className="text-red-500">🔴</span>
            {alert.equipmentName}
          </div>
          <div className="text-sm">{alert.message}</div>
        </div>,
        {
          duration: Infinity, // Don't auto-close
          closeButton: true,
        }
      );

      // Play alert sound (optional)
      playAlertSound();
    } else {
      // Equipment UP - auto-close after 5 seconds
      toast.success(
        <div className="flex flex-col gap-1">
          <div className="font-semibold flex items-center gap-2">
            <span className="text-green-500">🟢</span>
            {alert.equipmentName}
          </div>
          <div className="text-sm">{alert.message}</div>
        </div>,
        {
          duration: 5000,
        }
      );
    }
  }, []);

  /**
   * Handle notification acknowledged from Socket.IO
   */
  const handleNotificationAcknowledged = useCallback((data: NotificationAcknowledged) => {
    console.log('Notification acknowledged:', data);

    // Update notification in list
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === data.id
          ? {
              ...notif,
              acknowledged: true,
              acknowledgedBy: data.acknowledgedBy ? {
                _id: '',
                firstName: data.acknowledgedBy.firstName,
                lastName: data.acknowledgedBy.lastName,
                email: data.acknowledgedBy.email,
              } : undefined,
              acknowledgedAt: data.acknowledgedAt,
            }
          : notif
      )
    );

    // Decrement unacknowledged count
    setUnacknowledgedCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Play alert sound
   */
  const playAlertSound = () => {
    try {
      const audio = new Audio('/alert-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.warn('Could not play alert sound:', error);
      });
    } catch (error) {
      console.warn('Alert sound not available:', error);
    }
  };

  /**
   * Initialize Socket.IO connection
   */
  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const userRole = getUserRole();

    // Only connect if user is supervisor or admin
    if (token && (userRole === 'supervisor' || userRole === 'admin')) {
      console.log('Initializing Socket.IO connection for', userRole);

      // Connect to Socket.IO
      socketService.connect(token);

      // Listen for authenticated event
      socketService.onAuthenticated((data: AuthenticatedData) => {
        console.log('Socket authenticated:', data);
        setIsConnected(true);
        setCanReceiveAlerts(data.canReceiveAlerts);

        // Fetch initial data
        if (data.canReceiveAlerts) {
          fetchNotifications();
          refreshUnacknowledgedCount();
        }
      });

      // Listen for auth error
      socketService.onAuthError((error) => {
        console.error('Socket auth error:', error);
        setIsConnected(false);
        setCanReceiveAlerts(false);
        toast.error('Failed to connect to notification service');
      });

      // Listen for equipment alerts
      socketService.onEquipmentAlert(handleEquipmentAlert);

      // Listen for notification acknowledged
      socketService.onNotificationAcknowledged(handleNotificationAcknowledged);

      // Cleanup on unmount
      return () => {
        console.log('Cleaning up Socket.IO connection');
        socketService.disconnect();
      };
    }
  }, [fetchNotifications, refreshUnacknowledgedCount, handleEquipmentAlert, handleNotificationAcknowledged]);

  const value: NotificationContextType = {
    notifications,
    unacknowledgedCount,
    isConnected,
    canReceiveAlerts,
    loading,
    currentPage,
    totalPages,
    totalCount,
    fetchNotifications,
    acknowledgeNotification,
    deleteNotification,
    refreshUnacknowledgedCount,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

/**
 * Hook to use notification context
 */
export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
