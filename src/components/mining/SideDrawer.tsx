import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "../ui/sheet";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { 
  LayoutDashboard,
  FileText, 
  Settings,
  Upload,
  MessageSquare,
  Menu,
  LogOut,
  User,
  UserCog,
  HardHat,
  Edit3
} from "lucide-react";
import { UserRole } from "./LoginPage";

interface SideDrawerProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout?: () => void;
  userRole?: UserRole;
}

export function SideDrawer({ activeTab, onTabChange, open, onOpenChange, onLogout, userRole = 'admin' }: SideDrawerProps) {
  const baseNavigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      description: 'Overview and KPIs',
      roles: ['admin', 'supervisor', 'operator'] as UserRole[]
    },
    {
      id: 'data-entry',
      label: 'Data Entry',
      icon: <Edit3 className="h-5 w-5" />,
      description: 'Enter metallurgical data',
      roles: ['operator', 'supervisor'] as UserRole[]
    },
    {
      id: 'reports',
      label: 'Report Generation',
      icon: <FileText className="h-5 w-5" />,
      description: 'Create PDF and Excel reports',
      roles: ['admin', 'supervisor'] as UserRole[]
    },
    {
      id: 'data-import',
      label: 'Data Import',
      icon: <Upload className="h-5 w-5" />,
      description: 'Historian data upload',
      roles: ['admin'] as UserRole[]
    },
    {
      id: 'ai-chat',
      label: 'AI Assistant',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Query insights and analysis',
      roles: ['admin', 'supervisor', 'operator'] as UserRole[]
    }
  ];

  // Filter navigation items based on user role
  const navigationItems = baseNavigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const handleTabSelect = (tabId: string) => {
    onTabChange(tabId);
    onOpenChange(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <UserCog className="h-5 w-5" />;
      case 'supervisor': return <Settings className="h-5 w-5" />;
      case 'operator': return <HardHat className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'System Administrator';
      case 'supervisor': return 'Plant Supervisor';
      case 'operator': return 'Plant Operator';
      default: return 'User';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed top-4 left-4 z-50 bg-card border-border shadow-lg sm:bg-card/90 sm:backdrop-blur-sm"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 sm:w-96 bg-sidebar border-sidebar-border">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>
            Main navigation for the Mining Operations Analytics Platform
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 bg-sidebar-accent rounded-lg mb-6 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="bg-sidebar-primary rounded-full p-2">
              {getRoleIcon(userRole)}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sidebar-foreground capitalize">{userRole}</span>
                <Badge variant="outline" className="text-xs capitalize bg-sidebar-primary/10 text-sidebar-primary border-sidebar-primary/20">
                  {userRole}
                </Badge>
              </div>
              <div className="text-sm text-sidebar-foreground opacity-70">{getRoleTitle(userRole)}</div>
            </div>
          </div>
          {onLogout && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors"
              onClick={() => {
                onLogout();
                onOpenChange(false);
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Sign Out</span>
            </Button>
          )}
        </div>
        
        <div className="mt-6 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start h-auto p-4 ${
                activeTab === item.id 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
              onClick={() => handleTabSelect(item.id)}
            >
              <div className="flex items-center space-x-3 w-full">
                {item.icon}
                <div className="flex flex-col items-start space-y-1">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs opacity-70">{item.description}</span>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <Separator className="my-6 bg-sidebar-border" />

        <div className="space-y-4">

          {/* System Status */}
          <div className="space-y-2 px-3">
            <h3 className="text-sm font-medium text-sidebar-foreground opacity-70">
              System Status
            </h3>
            <div className="space-y-1 text-sm text-sidebar-foreground">
              <div className="flex justify-between">
                <span>Data Connection:</span>
                <span className="text-green-400">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Last Update:</span>
                <span>2 mins ago</span>
              </div>
              <div className="flex justify-between">
                <span>Equipment Online:</span>
                <span>47/52</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}