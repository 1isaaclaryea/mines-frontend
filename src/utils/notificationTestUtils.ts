/**
 * Notification System Test Utilities
 * Helper functions for testing the notification system
 */

import socketService from '../services/socketService';

/**
 * Get Socket.IO connection status
 */
export function getSocketStatus() {
  const isConnected = socketService.isConnected();
  const socket = socketService.getSocket();
  
  return {
    isConnected,
    socketId: socket?.id || null,
    transport: socket?.io?.engine?.transport?.name || null,
  };
}

/**
 * Log Socket.IO status to console
 */
export function logSocketStatus() {
  const status = getSocketStatus();
  console.log('=== Socket.IO Status ===');
  console.log('Connected:', status.isConnected);
  console.log('Socket ID:', status.socketId);
  console.log('Transport:', status.transport);
  console.log('=======================');
  return status;
}

/**
 * Test notification data structure
 */
export function createMockNotification(status: 'down' | 'up' = 'down') {
  return {
    id: `test-${Date.now()}`,
    tag: 'TEST.EQUIPMENT.TAG',
    equipmentName: 'Test Equipment',
    status,
    severity: status === 'down' ? 'critical' : 'info',
    message: `Test Equipment is ${status.toUpperCase()}`,
    timestamp: new Date().toISOString(),
    acknowledged: false,
  };
}

/**
 * Check if user can receive alerts
 */
export function canUserReceiveAlerts(): boolean {
  const userRole = localStorage.getItem('userRole');
  return userRole === 'supervisor' || userRole === 'admin';
}

/**
 * Get user authentication info
 */
export function getUserAuthInfo() {
  return {
    token: localStorage.getItem('token') || localStorage.getItem('authToken'),
    role: localStorage.getItem('userRole'),
    userId: localStorage.getItem('userId'),
    employeeId: localStorage.getItem('employeeId'),
    canReceiveAlerts: canUserReceiveAlerts(),
  };
}

/**
 * Log user authentication info
 */
export function logUserAuthInfo() {
  const info = getUserAuthInfo();
  console.log('=== User Auth Info ===');
  console.log('Has Token:', !!info.token);
  console.log('Role:', info.role);
  console.log('User ID:', info.userId);
  console.log('Employee ID:', info.employeeId);
  console.log('Can Receive Alerts:', info.canReceiveAlerts);
  console.log('=====================');
  return info;
}

/**
 * Run all diagnostic checks
 */
export function runNotificationDiagnostics() {
  console.log('\n🔍 Running Notification System Diagnostics...\n');
  
  const authInfo = logUserAuthInfo();
  console.log('\n');
  const socketStatus = logSocketStatus();
  
  console.log('\n📊 Diagnostic Summary:');
  
  if (!authInfo.token) {
    console.warn('⚠️ No authentication token found');
  } else {
    console.log('✅ Authentication token present');
  }
  
  if (!authInfo.canReceiveAlerts) {
    console.warn('⚠️ User role does not have alert permissions');
    console.log('   Current role:', authInfo.role);
    console.log('   Required: supervisor or admin');
  } else {
    console.log('✅ User has alert permissions');
  }
  
  if (!socketStatus.isConnected) {
    console.warn('⚠️ Socket.IO not connected');
  } else {
    console.log('✅ Socket.IO connected');
    console.log('   Socket ID:', socketStatus.socketId);
    console.log('   Transport:', socketStatus.transport);
  }
  
  console.log('\n');
  
  return {
    authInfo,
    socketStatus,
    allSystemsGo: authInfo.token && authInfo.canReceiveAlerts && socketStatus.isConnected,
  };
}

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).notificationTest = {
    getSocketStatus,
    logSocketStatus,
    createMockNotification,
    canUserReceiveAlerts,
    getUserAuthInfo,
    logUserAuthInfo,
    runDiagnostics: runNotificationDiagnostics,
  };
  
  console.log('💡 Notification test utilities available at: window.notificationTest');
  console.log('   Run: window.notificationTest.runDiagnostics()');
}
