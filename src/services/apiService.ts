/**
 * API Service for backend communication
 * Handles data entry submission and approval operations
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';

/**
 * Get authentication headers with JWT token
 * Matches Angular getHeaders() pattern
 */
const getAuthHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Try 'token' first (Angular pattern), fallback to 'authToken'
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

interface DataEntryPayload {
  employeeId: string;
  section: string;
  data: {
    [key: string]: {
      values: {
        time: string;
        value: string | number;
      }[];
    };
  };
}

interface ApproveDataEntryPayload {
  status: string;
  supervisorId: string;
}

interface RejectDataEntryPayload {
  supervisorId: string;
}

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    employeeId: string;
    role: string;
    email: string;
    isActive: boolean;
  };
}

/**
 * Login to backend and get JWT token
 * Matches Angular implementation pattern
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Invalid credentials');
  }

  const data = await response.json();
  
  // Store token and user data in localStorage (matching Angular pattern)
  localStorage.setItem('token', data.token);  // Match Angular key name
  localStorage.setItem('authToken', data.token);  // Keep for backward compatibility
  localStorage.setItem('userData', JSON.stringify(data.user));
  localStorage.setItem('userSection', data.user.section || '');
  localStorage.setItem('employeeId', data.user.employeeId);
  localStorage.setItem('userRole', data.user.role);
  localStorage.setItem('userId', data.user._id);
  localStorage.setItem('userIsAdmin', data.user.isAdmin?.toString() || 'false');
  
  return data;
}

/**
 * Logout and clear authentication data
 * Matches Angular logout pattern - clears all localStorage
 */
export async function logout(): Promise<void> {
  try {
    // Call backend logout endpoint to blacklist token
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Clear all local storage (matching Angular pattern)
    localStorage.clear();
  }
}

/**
 * Get stored user data
 */
export function getStoredUser(): LoginResponse['user'] | null {
  const userData = localStorage.getItem('userData');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 * Matches Angular pattern - checks for 'token' key
 */
export function isAuthenticated(): boolean {
  return !!(localStorage.getItem('token') || localStorage.getItem('authToken'));
}

/**
 * Get user role from localStorage
 * Matches Angular pattern
 */
export function getUserRole(): string | null {
  return localStorage.getItem('userRole');
}

/**
 * Check if user is admin
 * Matches Angular isAdmin getter pattern
 */
export function isAdmin(): boolean {
  return localStorage.getItem('userIsAdmin') === 'true';
}

/**
 * Submit data entry to backend
 * Note: Requires authentication - will return 401 if not authenticated
 */
export async function submitDataEntry(
  employeeId: string,
  section: string,
  data: any
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/data-entry`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      employeeId,
      section,
      data,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Provide more specific error messages
    if (response.status === 401) {
      throw new Error('Authentication required. Please implement backend authentication.');
    }
    
    throw new Error(errorData.message || `Failed to submit data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Approve data entry
 */
export async function approveDataEntry(
  entryId: string,
  status: string,
  supervisorId: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/data-entry/${entryId}/approve`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status,
      supervisorId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Provide more specific error messages
    if (response.status === 401) {
      throw new Error('Please authenticate');
    }
    
    throw new Error(errorData.message || `Failed to approve data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Reject data entry
 */
export async function rejectDataEntry(supervisorId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/data-entry/reject`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      supervisorId,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Provide more specific error messages
    if (response.status === 401) {
      throw new Error('Please authenticate');
    }
    
    throw new Error(errorData.message || `Failed to reject data: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get today's data entry for a specific section
 * Matches Angular getTodayDataEntry pattern
 */
export async function getTodayDataEntry(section: string): Promise<any> {
  const params = new URLSearchParams({
    section,
  });

  const response = await fetch(`${API_BASE_URL}/data-entry/today?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to get today's data: ${response.statusText}`);
  }

  const result = await response.json();
  // The API returns { message: string, data: any }
  // We're interested in the data property
  return result.data;
}

/**
 * Get data entries by section and date range
 * Matches Angular getDataEntries pattern
 */
export async function getDataEntries(section: string, date: Date): Promise<any> {
  // Create start and end of day dates
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const params = new URLSearchParams({
    section,
    startDate: startOfDay.toISOString(),
    endDate: endOfDay.toISOString(),
  });

  const response = await fetch(`${API_BASE_URL}/data-entry?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to get data entries: ${response.statusText}`);
  }

  return response.json();
}
