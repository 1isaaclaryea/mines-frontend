import { PushNotifications, PermissionStatus, Token } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';

export interface PushNotificationData {
  title: string;
  body: string;
  data?: any;
}

class PushNotificationService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Request permission to use push notifications
      const permission = await this.requestPermissions();
      
      if (permission.receive !== 'granted') {
        console.warn('Push notification permission not granted');
        return;
      }

      // Register with APNs (iOS) / FCM (Android)
      await this.registerForPushNotifications();

      // Set up listeners
      this.setupListeners();

      this.isInitialized = true;
      console.log('Push notifications initialized successfully');
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private async requestPermissions(): Promise<PermissionStatus> {
    return await PushNotifications.requestPermissions();
  }

  private async registerForPushNotifications(): Promise<void> {
    try {
      const result = await PushNotifications.register();
      console.log('Push registration success');
      
      // Note: The token is handled in the registration listener
      // We'll get the token in the listener setup
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  }

  private setupListeners(): void {
    // Handle registration token
    PushNotifications.addListener(
      'registration',
      (token) => {
        console.log('Push registration token:', token);
        this.sendTokenToBackend(token.value);
      }
    );

    // Handle notification received while app is in foreground
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.log('Push notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Handle notification click/tap
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.log('Push notification action performed:', notification);
        this.handleNotificationActionPerformed(notification);
      }
    );

    // Handle registration error
    PushNotifications.addListener(
      'registrationError',
      (error) => {
        console.error('Error on registration:', error.error);
      }
    );

    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        console.log('App became active, checking for pending notifications');
        this.checkForPendingNotifications();
      }
    });
  }

  private handleNotificationReceived(notification: any): void {
    const { title, body, data } = notification;
    
    // Show in-app notification or update UI
    this.showInAppNotification({
      title,
      body,
      data
    });
  }

  private handleNotificationActionPerformed(notification: any): void {
    const { notificationData } = notification;
    
    // Navigate to specific page based on notification data
    if (notificationData?.data?.route) {
      this.navigateToPage(notificationData.data.route);
    }
  }

  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      // Replace with your backend API endpoint
      const response = await fetch('/api/notifications/register-push-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: this.getPlatform(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register token with backend');
      }

      console.log('Token registered with backend successfully');
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }

  private getPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) return 'android';
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
    return 'web';
  }

  private showInAppNotification(notification: PushNotificationData): void {
    // Create a custom in-app notification
    // You can use a toast library like sonner (already installed)
    import('sonner').then(({ toast }) => {
      toast(notification.title, {
        description: notification.body,
        action: {
          label: 'View',
          onClick: () => this.handleNotificationAction(notification.data),
        },
      });
    });
  }

  private handleNotificationAction(data: any): void {
    // Handle notification-specific actions
    if (data?.route) {
      this.navigateToPage(data.route);
    }
  }

  private navigateToPage(route: string): void {
    // Use React Router or your navigation method
    window.location.hash = route;
  }

  private async checkForPendingNotifications(): Promise<void> {
    // Check for any notifications that were received while app was closed
    const notifications = await PushNotifications.getDeliveredNotifications();
    console.log('Pending notifications:', notifications);
  }

  // Public methods for sending local notifications (if needed)
  async sendLocalNotification(notification: PushNotificationData): Promise<void> {
    try {
      // Create notification channel for Android
      await PushNotifications.createChannel({
        id: 'equipment-alerts',
        name: 'Equipment Alerts',
        importance: 4,
        sound: 'default',
        description: 'Critical equipment alerts and notifications',
      });

      // Schedule local notification
      await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.title,
            body: notification.body,
            id: new Date().getTime(),
            schedule: { at: new Date() },
            sound: 'default',
            extra: notification.data,
            smallIcon: 'ic_stat_notification',
            iconColor: '#FF0000',
          },
        ],
      });

      console.log('Local notification sent:', notification);
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await PushNotifications.removeAllDeliveredNotifications();
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }
}

export const pushNotificationService = new PushNotificationService();
