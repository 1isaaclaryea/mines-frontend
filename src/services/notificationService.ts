/**
 * Notification API Service
 * Handles REST API calls for equipment notifications
 */

import { getAuthHeaders } from './apiService';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

export interface Notification {
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

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export interface UnacknowledgedCountResponse {
  success: boolean;
  count: number;
}

export interface AcknowledgeResponse {
  success: boolean;
  notification: Notification;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  status?: 'down' | 'up';
  acknowledged?: boolean;
  severity?: 'critical' | 'warning' | 'info';
  startDate?: string;
  endDate?: string;
}

/**
 * Get paginated list of notifications
 */
export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<NotificationsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.acknowledged !== undefined) queryParams.append('acknowledged', params.acknowledged.toString());
  if (params.severity) queryParams.append('severity', params.severity);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);

  const url = `${API_BASE_URL}/notifications?${queryParams}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      if (response.status === 404) {
        throw new Error('Notifications endpoint not found. Check backend URL configuration.');
      }
      
      if (response.status === 500) {
        throw new Error(`Server error: ${errorData.message || response.statusText}`);
      }
      
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    // Network errors (backend not reachable)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('Network error - Backend URL:', url);
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Is the server running?`);
    }
    
    // Re-throw other errors
    throw error;
  }
}

/**
 * Get count of unacknowledged notifications
 */
export async function getUnacknowledgedCount(): Promise<UnacknowledgedCountResponse> {
  const response = await fetch(`${API_BASE_URL}/notifications/unacknowledged`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    
    throw new Error(errorData.message || `Failed to fetch unacknowledged count: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Acknowledge a notification
 */
export async function acknowledgeNotification(id: string): Promise<AcknowledgeResponse> {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/acknowledge`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    
    throw new Error(errorData.message || `Failed to acknowledge notification: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a notification (admin only)
 */
export async function deleteNotification(id: string): Promise<DeleteResponse> {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    
    if (response.status === 403) {
      throw new Error('Admin access required');
    }
    
    throw new Error(errorData.message || `Failed to delete notification: ${response.statusText}`);
  }

  return response.json();
}
