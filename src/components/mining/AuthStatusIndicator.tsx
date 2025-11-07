import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Server,
  Key,
  Database
} from 'lucide-react';
import { isAuthenticated, getStoredUser } from '../../services/apiService';

interface AuthStatusIndicatorProps {
  compact?: boolean;
}

export function AuthStatusIndicator({ compact = false }: AuthStatusIndicatorProps) {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [hasToken, setHasToken] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const checkStatus = async () => {
    // Check if token exists
    const authenticated = isAuthenticated();
    setHasToken(authenticated);

    // Get user info
    const user = getStoredUser();
    setUserName(user?.name || null);

    // Check backend connectivity
    setBackendStatus('checking');
    try {
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (error) {
      console.error('Backend health check failed:', error);
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    checkStatus();
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {backendStatus === 'online' && hasToken ? (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Limited
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>System Status</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkStatus}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Backend Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Backend API</span>
          </div>
          {backendStatus === 'checking' ? (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Checking
            </Badge>
          ) : backendStatus === 'online' ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Online
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-500/10 text-red-500">
              <XCircle className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
        </div>

        {/* Authentication Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Authentication</span>
          </div>
          {hasToken ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              No Token
            </Badge>
          )}
        </div>

        {/* Historian Access */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Historian Data</span>
          </div>
          {backendStatus === 'online' && hasToken ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Available
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-500/10 text-red-500">
              <XCircle className="h-3 w-3 mr-1" />
              Unavailable
            </Badge>
          )}
        </div>

        {/* User Info */}
        {userName && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Logged in as: <span className="font-medium text-foreground">{userName}</span>
            </p>
          </div>
        )}

        {/* Warning Message */}
        {(!hasToken || backendStatus === 'offline') && (
          <div className="pt-2 border-t">
            <div className="flex items-start space-x-2 text-yellow-500">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="text-xs space-y-1">
                {!hasToken && (
                  <p>Please log in to access real-time historian data.</p>
                )}
                {backendStatus === 'offline' && (
                  <p>Backend server is not responding. Check your connection or backend URL.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Backend URL Info */}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Backend: <span className="font-mono">{import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
