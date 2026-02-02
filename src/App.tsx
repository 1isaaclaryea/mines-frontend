import { useState, useEffect, useRef, useCallback } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './config/authConfig';
import { LoginPage, UserRole } from './components/mining/LoginPage';
import { isAuthenticated as checkAuth, getStoredUser, logout as apiLogout, isTokenExpired } from './services/apiService';
import { toast } from 'sonner';
import { SideDrawer } from './components/mining/SideDrawer';
import { App as CapacitorApp } from '@capacitor/app';
import { TimeRangeSelector } from './components/mining/TimeRangeSelector';
import { KPICard } from './components/mining/KPICard';
import { KPIHistoryDialog } from './components/mining/KPIHistoryDialog';
import { RecentNotificationsPanel } from './components/mining/RecentNotificationsPanel';
import { EquipmentStatus } from './components/mining/EquipmentStatus';
import { CriticalParameters } from './components/mining/CriticalParameters';
import { BreakdownReporter } from './components/mining/BreakdownReporter';
import { ProductionChart } from './components/mining/ProductionChart';
import { ReportGenerationPanel } from './components/mining/ReportGenerationPanel';
import { ProcessParametersPanel } from './components/mining/ProcessParametersPanel';
import { DataImportPanel } from './components/mining/DataImportPanel';
import { AIChatPanel } from './components/mining/AIChatPanel';
import { DataEntryPanelWithOneDrive } from './components/mining/DataEntryPanelWithOneDrive';
import { DowntimesPanel } from './components/mining/DowntimesPanel';
import { CriticalEquipmentDashboard } from './components/mining/CriticalEquipmentDashboard';
import { NotificationProvider } from './context/NotificationContext';
import { NotificationBell } from './components/mining/NotificationBell';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { pushNotificationService } from './services/pushNotificationService';
import {
  mockKPIs,
  mockAlerts,
  mockEquipment,
  mockKPIHistory
} from './components/mining/mockData';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  Cog,
  AlertTriangle,
  Plus
} from 'lucide-react';

// Import notification test utilities (available in console as window.notificationTest)
import './utils/notificationTestUtils';

// Initialize MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

interface Equipment {
  id: string;
  name: string;
  type: 'crusher' | 'conveyor' | 'separator' | 'pump' | 'generator';
  status: 'optimal' | 'caution' | 'critical' | 'offline';
  health: number;
  temperature: number;
  powerUsage: number;
  efficiency: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  equipment: string;
  timestamp: string;
  prediction?: boolean;
  timeToFailure?: string;
}

interface BreakdownReport {
  id: string;
  equipment: string;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  reportedBy: string;
  timestamp: string;
  category: string;
}

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [breakdownReporterOpen, setBreakdownReporterOpen] = useState(false);
  const [kpiDialogOpen, setKpiDialogOpen] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | undefined>(undefined);

  // Navigation history tracking
  const isNavigatingBack = useRef(false);
  const isInitialLoad = useRef(true);

  // Define allowed tabs per role
  const getAllowedTabs = useCallback((role: UserRole): string[] => {
    switch (role) {
      case 'admin':
        return ['dashboard', 'critical-status', 'data-entry', 'reports', 'data-import', 'ai-chat', 'downtimes', 'equipment'];
      case 'supervisor':
        return ['dashboard', 'critical-status', 'data-entry', 'reports', 'ai-chat', 'downtimes', 'equipment'];
      case 'operator':
        return ['data-entry']; // Operators can ONLY access data-entry
      default:
        return ['data-entry'];
    }
  }, []);

  // Check if a tab is allowed for the current role
  const isTabAllowed = useCallback((tab: string): boolean => {
    return getAllowedTabs(userRole).includes(tab);
  }, [userRole, getAllowedTabs]);

  // Get default tab for role
  const getDefaultTab = useCallback((role: UserRole): string => {
    return role === 'operator' ? 'data-entry' : 'dashboard';
  }, []);

  // Custom navigation function that pushes to history
  const navigateTo = useCallback((tab: string, section?: string) => {
    // Check if user is allowed to access this tab
    if (!isTabAllowed(tab)) {
      const defaultTab = getDefaultTab(userRole);
      tab = defaultTab;
      section = undefined;
    }

    if (!isNavigatingBack.current) {
      const state = { tab, section };
      window.history.pushState(state, '', `#/${tab}${section ? `/${section}` : ''}`);
    }
    isNavigatingBack.current = false;
    setActiveTab(tab);
    if (section !== undefined) {
      setSelectedSection(section);
    }
  }, [isTabAllowed, getDefaultTab, userRole]);

  // Handle browser/mobile back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isNavigatingBack.current = true;
      let targetTab = event.state?.tab || 'dashboard';

      // Check if user is allowed to access this tab
      if (!isTabAllowed(targetTab)) {
        targetTab = getDefaultTab(userRole);
        // Replace current history state with allowed tab
        window.history.replaceState({ tab: targetTab }, '', `#/${targetTab}`);
      }

      setActiveTab(targetTab);
      if (event.state?.section !== undefined) {
        setSelectedSection(event.state.section);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isTabAllowed, getDefaultTab, userRole]);

  // Push initial state to history
  useEffect(() => {
    if (isInitialLoad.current && isAuthenticated) {
      const state = { tab: activeTab, section: selectedSection };
      window.history.replaceState(state, '', `#/${activeTab}`);
      isInitialLoad.current = false;
    }
  }, [isAuthenticated, activeTab, selectedSection]);

  // Capacitor back button handler for Android
  useEffect(() => {
    let backButtonListener: { remove: () => void } | null = null;

    const setupBackButton = async () => {
      try {
        backButtonListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            // At root - optionally minimize app or show exit confirmation
            CapacitorApp.minimizeApp();
          }
        });
      } catch (error) {
        // Not running in Capacitor environment (web browser)
        console.log('Capacitor back button not available (running in browser)');
      }
    };

    if (isAuthenticated) {
      setupBackButton();
    }

    return () => {
      backButtonListener?.remove();
    };
  }, [isAuthenticated]);

  // Check for existing session on load (matching Angular pattern)
  useEffect(() => {
    // Initialize push notifications after authentication check
    const initializePushNotifications = async () => {
      if (checkAuth()) {
        if (isTokenExpired()) {
          // Token is expired, clear authentication state
          console.log('Token expired, clearing authentication');
          localStorage.clear();
          setIsAuthenticated(false);
          
          // Notify user that their session has expired
          toast.error('Session Expired', {
            description: 'Your session has expired. Please login again.',
            duration: 5000,
          });
          return;
        }
        
        // Token is valid, restore user session
        const user = getStoredUser();
        if (user) {
          setIsAuthenticated(true);
          setUserRole(user.role.toLowerCase() as UserRole);
          setEmployeeId(user.employeeId);
          setUserName(user.name);
          
          // Initialize push notifications for authenticated users
          try {
            await pushNotificationService.initialize();
          } catch (error) {
            console.warn('Failed to initialize push notifications:', error);
          }
          
          // Set default tab based on role (matching Angular pattern)
          // Angular checks userRole from localStorage in constructor
          if (user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'supervisor') {
            navigateTo('dashboard');
          } else {
            navigateTo('data-entry');
          }
        }
      }
    };

    initializePushNotifications();
  }, []);

  const handleLogin = async (role: UserRole, empId: string, name: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setEmployeeId(empId);
    setUserName(name);
    localStorage.setItem('miningOpsAuth', 'true');
    localStorage.setItem('miningOpsRole', role);
    
    // Initialize push notifications after successful login
    try {
      await pushNotificationService.initialize();
    } catch (error) {
      console.warn('Failed to initialize push notifications after login:', error);
    }
    
    // Set default tab based on role (matching Angular routing pattern)
    // Angular: admin/supervisor -> /accounts, operators -> /data-entry
    if (role === 'admin' || role === 'supervisor') {
      navigateTo('dashboard'); // React equivalent of /accounts
    } else {
      navigateTo('data-entry'); // Operators go to data entry
    }
  };

  const handleLogout = async () => {
    await apiLogout();
    setIsAuthenticated(false);
    setUserRole('admin');
    setEmployeeId('');
    setUserName('');
    localStorage.removeItem('miningOpsRole');
    // Clear history and reset to login (don't push to history since user is logging out)
    window.history.replaceState(null, '', '/');
    setActiveTab('dashboard'); // Reset to dashboard
    setSelectedEquipment(null);
  };

  const handleEquipmentClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    navigateTo('equipment');
  };

  const handleBreakdownReport = (report: BreakdownReport) => {
    // Convert breakdown report to alert format
    const newAlert: Alert = {
      id: `report-${report.id}`,
      severity: report.severity,
      message: `${report.description} [User Reported]`,
      equipment: report.equipment,
      timestamp: report.timestamp,
      prediction: false
    };
    
    // Add to alerts array
    setAlerts(prev => [newAlert, ...prev]);
    
    // Close the dialog after successful submission
    setBreakdownReporterOpen(false);
  };

  const kpiIcons = [
    <Activity className="h-5 w-5" />,
    <Zap className="h-5 w-5" />,
    <TrendingUp className="h-5 w-5" />,
    <Cog className="h-5 w-5" />
  ];

  const handleKPIClick = (kpiTitle: string) => {
    setSelectedKPI(kpiTitle);
    setKpiDialogOpen(true);
  };

  const handleSectionClick = (sectionId: string) => {
    navigateTo('equipment', sectionId);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKPIs.map((kpi, index) => (
          <KPICard 
            key={index}
            title={kpi.title}
            value={kpi.value}
            unit={kpi.unit}
            change={kpi.change}
            status={kpi.status}
            target={kpi.target}
            icon={kpiIcons[index]}
            onClick={() => handleKPIClick(kpi.title)}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Chart */}
        <div className="lg:col-span-2">
          <ProductionChart />
        </div>

        {/* Recent Notifications Panel */}
        <RecentNotificationsPanel />
      </div>

      {/* Critical Parameters */}
      <CriticalParameters onSectionClick={handleSectionClick} />
    </div>
  );



  // Use browser history for back navigation (works on web and mobile)
  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('dashboard');
    }
  }, [navigateTo]);

  const renderProcessParameters = () => (
    <ProcessParametersPanel section={selectedSection} onBack={handleBack} />
  );

  const renderDataImport = () => (
    <DataImportPanel onBack={handleBack} />
  );

  const renderAIChat = () => (
    <AIChatPanel onBack={handleBack} />
  );

  const renderDowntimes = () => (
    <DowntimesPanel onBack={handleBack} />
  );

  const renderCriticalStatus = () => (
    <CriticalEquipmentDashboard
      onViewSection={(sectionId) => {
        setSelectedSection(sectionId);
        navigateTo('equipment');
      }}
    />
  );

  const renderReports = () => (
    <ReportGenerationPanel onBack={handleBack} />
  );

  const renderDataEntry = () => (
    <DataEntryPanelWithOneDrive userRole={userRole} employeeId={employeeId} userName={userName} onBack={handleBack} />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'critical-status': return renderCriticalStatus();
      case 'data-entry': return renderDataEntry();
      case 'reports': return renderReports();
      case 'equipment': return renderProcessParameters();
      case 'data-import': return renderDataImport();
      case 'ai-chat': return renderAIChat();
      case 'downtimes': return renderDowntimes();
      default: return renderDashboard();
    }
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Side Drawer Navigation */}
      <SideDrawer
        activeTab={activeTab}
        onTabChange={navigateTo}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onLogout={handleLogout}
        userRole={userRole}
      />
      <div className="container mx-auto p-6 sm:px-8 sm:pl-20 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="space-y-1">
            <img 
              src="/images/LOGO_INSIGHT.png" 
              alt="Larnis Insights" 
              style={{ height: '12rem', width: 'auto', marginBottom: '-2rem', marginTop: '-2rem' }}
            />
            <p className="hidden sm:block text-muted-foreground text-sm sm:text-base">
              Real-time monitoring, predictive maintenance, and process optimization
            </p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex-1 lg:flex-initial">
              <TimeRangeSelector 
                value={timeRange}
                onChange={setTimeRange}
              />
            </div>
            <NotificationBell />
          </div>
        </div>

        {/* Main Content */}
        {renderContent()}
      </div>

      {/* Floating Action Button for Breakdown Reporter */}
      <Button
        onClick={() => setBreakdownReporterOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
        size="icon"
      >
        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
      </Button>

      {/* Breakdown Reporter Dialog */}
      <Dialog open={breakdownReporterOpen} onOpenChange={setBreakdownReporterOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border mx-4">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span>Report Equipment Breakdown</span>
              </div>
            </DialogTitle>
            <DialogDescription>
              Submit a breakdown report for equipment issues. This will create an alert and notify maintenance teams.
            </DialogDescription>
          </DialogHeader>
          <BreakdownReporter onReportSubmit={handleBreakdownReport} />
        </DialogContent>
      </Dialog>

      {/* KPI History Dialog */}
      {selectedKPI && (
        <KPIHistoryDialog
          open={kpiDialogOpen}
          onOpenChange={setKpiDialogOpen}
          title={selectedKPI}
          history={mockKPIHistory[selectedKPI as keyof typeof mockKPIHistory] || []}
          icon={kpiIcons[mockKPIs.findIndex(kpi => kpi.title === selectedKPI)]}
        />
      )}
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}

// Wrap with MSAL Provider and NotificationProvider
export default function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </MsalProvider>
  );
}