import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { login } from '../../services/apiService';
import { 
  Shield, 
  User, 
  Lock, 
  AlertTriangle,
  UserCog,
  Settings,
  HardHat
} from 'lucide-react';

export type UserRole = 'admin' | 'operator' | 'supervisor';

interface LoginPageProps {
  onLogin: (role: UserRole, employeeId: string, userName: string) => void;
}

// Demo credentials for testing (these should exist in the backend)
const demoCredentials = {
  admin: { email: 'admin@mines.com', password: 'admin' },
  operator: { email: 'operator@mines.com', password: 'operator' },
  supervisor: { email: 'supervisor2@mines.com', password: 'supervisor' }
};

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('admin@mines.com');
  const [password, setPassword] = useState('admin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call backend login API
      const response = await login(email, password);
      
      // Map backend role to frontend UserRole type
      const userRole = response.user.role.toLowerCase() as UserRole;
      
      // Call onLogin with user data
      onLogin(userRole, response.user.employeeId, response.user.name);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError('');
    // Auto-fill credentials for demo purposes
    const credentials = demoCredentials[role];
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <UserCog className="h-4 w-4" />;
      case 'supervisor': return <Settings className="h-4 w-4" />;
      case 'operator': return <HardHat className="h-4 w-4" />;
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Full system access and configuration';
      case 'supervisor': return 'Monitor operations and manage teams';
      case 'operator': return 'View dashboards and report issues';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 dark">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Mining Operations</h1>
          </div>
          <p className="text-muted-foreground">
            Secure access to analytics platform
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-border">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access the mining operations dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>Select Role</Label>
                <div className="grid grid-cols-1 gap-2">
                  {(['admin', 'supervisor', 'operator'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                        selectedRole === role
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {getRoleIcon(role)}
                        <div className="text-left">
                          <p className="font-medium capitalize">{role}</p>
                          <p className="text-xs text-muted-foreground">{getRoleDescription(role)}</p>
                        </div>
                      </div>
                      {selectedRole === role && (
                        <Badge variant="default" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <Alert className="border-red-500/50 bg-red-500/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-input border-border focus:border-primary"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 bg-input border-border focus:border-primary"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-3">Demo Credentials:</p>
              <div className="space-y-3">
                {Object.entries(demoCredentials).map(([role, creds]) => (
                  <div key={role} className="text-xs">
                    <div className="flex items-center space-x-2 mb-1">
                      {getRoleIcon(role as UserRole)}
                      <span className="font-medium capitalize text-foreground">{role}</span>
                    </div>
                    <div className="ml-6 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-foreground font-mono">{creds.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Password:</span>
                        <span className="text-foreground font-mono">{creds.password}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Selecting a role auto-fills the credentials
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Mining Operations Analytics Platform v2.1</p>
          <p>Secure • Real-time • Predictive</p>
        </div>
      </div>
    </div>
  );
}