import { useState, useEffect } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './config/authConfig';
import { LoginPage, UserRole } from './components/mining/LoginPage';
import { isAuthenticated as checkAuth, getStoredUser, logout as apiLogout, isTokenExpired } from './services/apiService';
import { toast } from 'sonner';
import { SideDrawer } from './components/mining/SideDrawer';
import { TimeRangeSelector } from './components/mining/TimeRangeSelector';
import { KPICard } from './components/mining/KPICard';
import { KPIHistoryDialog } from './components/mining/KPIHistoryDialog';
import { AlertPanel } from './components/mining/AlertPanel';
import { EquipmentStatus } from './components/mining/EquipmentStatus';
import { CriticalParameters } from './components/mining/CriticalParameters';
import { BreakdownReporter } from './components/mining/BreakdownReporter';
import { ProductionChart } from './components/mining/ProductionChart';
import { ReportGenerationPanel } from './components/mining/ReportGenerationPanel';
import { ProcessParametersPanel } from './components/mining/ProcessParametersPanel';
import { DataImportPanel } from './components/mining/DataImportPanel';
import { AIChatPanel } from './components/mining/AIChatPanel';
import { DataEntryPanelWithOneDrive } from './components/mining/DataEntryPanelWithOneDrive';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './components/ui/dialog';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { 
  mockKPIs, 
  mockAlerts, 
  mockEquipment, 
  mockProductionData,
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

  // Check for existing session on load (matching Angular pattern)
  useEffect(() => {
    // Check if token exists and is not expired
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
        
        // Set default tab based on role (matching Angular pattern)
        // Angular checks userRole from localStorage in constructor
        if (user.role.toLowerCase() === 'admin') {
          setActiveTab('dashboard');
        } else {
          setActiveTab('data-entry');
        }
      }
    }
  }, []);

  const handleLogin = (role: UserRole, empId: string, name: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setEmployeeId(empId);
    setUserName(name);
    localStorage.setItem('miningOpsAuth', 'true');
    localStorage.setItem('miningOpsRole', role);
    
    // Set default tab based on role (matching Angular routing pattern)
    // Angular: admin -> /accounts, others -> /data-entry
    if (role === 'admin') {
      setActiveTab('dashboard'); // React equivalent of /accounts
    } else {
      setActiveTab('data-entry'); // Matches Angular pattern
    }
  };

  const handleLogout = async () => {
    await apiLogout();
    setIsAuthenticated(false);
    setUserRole('admin');
    setEmployeeId('');
    setUserName('');
    localStorage.removeItem('miningOpsRole');
    setActiveTab('dashboard'); // Reset to dashboard
    setSelectedEquipment(null);
  };

  const handleEquipmentClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setActiveTab('equipment');
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
    setSelectedSection(sectionId);
    setActiveTab('equipment');
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
          <ProductionChart 
            data={mockProductionData}
            title="Production Performance (24h)"
          />
        </div>

        {/* Alert Panel */}
        <AlertPanel alerts={alerts} />
      </div>

      {/* Critical Parameters */}
      <CriticalParameters onSectionClick={handleSectionClick} />
    </div>
  );



  const renderProcessParameters = () => (
    <ProcessParametersPanel section={selectedSection} onBack={() => setActiveTab('dashboard')} />
  );

  const renderDataImport = () => (
    <DataImportPanel onBack={() => setActiveTab('dashboard')} />
  );

  const renderAIChat = () => (
    <AIChatPanel onBack={() => setActiveTab('dashboard')} />
  );

  const renderReports = () => (
    <ReportGenerationPanel onBack={() => setActiveTab('dashboard')} />
  );

  const renderDataEntry = () => (
    <DataEntryPanelWithOneDrive userRole={userRole} employeeId={employeeId} userName={userName} onBack={() => setActiveTab('dashboard')} />
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'data-entry': return renderDataEntry();
      case 'reports': return renderReports();
      case 'equipment': return renderProcessParameters();
      case 'data-import': return renderDataImport();
      case 'ai-chat': return renderAIChat();
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
        onTabChange={setActiveTab}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onLogout={handleLogout}
        userRole={userRole}
      />

      <div className="container mx-auto p-6 sm:px-8 sm:pl-20 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold">Mining Operations Analytics</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Real-time monitoring, predictive maintenance, and process optimization
            </p>
          </div>
          <div className="w-full lg:w-auto">
            <TimeRangeSelector 
              value={timeRange}
              onChange={setTimeRange}
            />
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

// Wrap with MSAL Provider
export default function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <AppContent />
    </MsalProvider>
  );
}