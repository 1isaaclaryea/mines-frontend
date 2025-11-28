import { useState, useRef, useCallback, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../config/authConfig';
import Spreadsheet, { CellBase, Matrix } from 'react-spreadsheet';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../ui/alert-dialog';
import { UserRole } from './LoginPage';
import { useOneDriveExcelPersonal } from '../../hooks/useOneDriveExcelPersonal';
import { submitDataEntry, approveDataEntry, getDataEntries } from '../../services/apiService';
import { 
  Save, 
  Download, 
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  XCircle,
  FileSpreadsheet,
  Cloud,
  CloudOff,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

// Section types matching Angular implementation
type SectionType = 'cil' | 'crushing' | 'sag';

interface Section {
  id: number;
  name: string;
  type: SectionType;
}

const sections: Section[] = [
  { id: 1, name: 'CIL Plant Monitoring', type: 'cil' },
  { id: 2, name: 'Crushing Shift Tonnes', type: 'crushing' },
  { id: 3, name: 'SAG01 Mill', type: 'sag' }
];

// CIL column headers
const CIL_HEADERS = ['TIME', 'SOLN Au (ppm)', '% SOLIDS', 'pH', 'CN CONC (ppm)', 'DO (mg/L)', 'CAR CONC (g/L)'];

// Generate time slots based on current hour (12-hour shifts)
const generateTimeSlots = (): string[] => {
  const currentHour = new Date().getHours();
  const timeSlots: string[] = [];
  let startHour: number;
  
  if (currentHour >= 6 && currentHour < 18) {
    startHour = 6;  // 6 AM - 6 PM
  } else if (currentHour >= 18 && currentHour < 24) {
    startHour = 18; // 6 PM - 12 AM
  } else {
    startHour = 0;  // 12 AM - 6 AM
  }

  for (let i = 0; i < 13; i++) {
    const hour = (startHour + i) % 24;
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  }

  return timeSlots;
};

// Initialize empty spreadsheet data for CIL
const initializeCILData = (): Matrix<CellBase<any>> => {
  const timeSlots = generateTimeSlots();
  const data: Matrix<CellBase<any>> = [];
  
  // Header row
  data.push(CIL_HEADERS.map(header => ({ value: header, readOnly: true })));
  
  // Data rows
  timeSlots.forEach(time => {
    data.push([
      { value: time, readOnly: true },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: '' },
      { value: '' }
    ]);
  });
  
  return data;
};

interface DataEntryPanelWithOneDriveProps {
  userRole: UserRole;
  employeeId: string;
  userName: string;
  onBack?: () => void;
}

export function DataEntryPanelWithOneDrive({ userRole, employeeId, userName, onBack }: DataEntryPanelWithOneDriveProps) {
  const { instance, accounts } = useMsal();
  const [selectedSection, setSelectedSection] = useState<Section>(sections[0]);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState<Matrix<CellBase<any>>>([]);
  const [oneDriveConnected, setOneDriveConnected] = useState(false);
  const [hasLoadedFile, setHasLoadedFile] = useState(false);
  const FIXED_FILE_ID = '01L3LKPPZRZW5RQDRZSFFZGOM27O2PJEBQ';
  const [oneDriveWorksheet] = useState('Sheet1');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  const {
    isLoading,
    loadExcelData,
    saveExcelData,
    getFileByPath,
    getFileFromShareLink,
  } = useOneDriveExcelPersonal();

  // Load existing data entry from backend to get entry ID and status
  const loadExistingDataEntry = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const response = await getDataEntries(selectedSection.type, today);
      
      if (response && response.length > 0) {
        const entry = response[0];
        setCurrentEntryId(entry._id);
        setApprovalStatus(entry.status || 'pending');
        console.log('Loaded existing entry:', entry._id, 'Status:', entry.status);
      } else {
        setCurrentEntryId(null);
        setApprovalStatus('pending');
      }
    } catch (error) {
      console.error('Error loading existing data entry:', error);
      // Don't show error toast, just log it
    }
  }, [selectedSection.type]);

  // Auto-load the fixed file after sign-in
  const handleAutoLoadFile = useCallback(async () => {
    try {
      const data = await loadExcelData(FIXED_FILE_ID, oneDriveWorksheet);
      if (!data) return;

      // Convert to spreadsheet format
      const formattedData: Matrix<CellBase<any>> = data.map((row, rowIndex) => 
        (row || []).map((cell, colIndex) => ({
          value: cell ?? '',
          readOnly: rowIndex === 0 || colIndex === 0
        }))
      );

      setSpreadsheetData(formattedData);
      setHasLoadedFile(true);
      toast.success('Test file loaded successfully!');
      
      // Load existing data entry to get entry ID
      await loadExistingDataEntry();
    } catch (error) {
      console.error('Error auto-loading file:', error);
      toast.error('Failed to load test file');
    }
  }, [loadExcelData, oneDriveWorksheet, FIXED_FILE_ID, loadExistingDataEntry]);

  // Check if user is signed in to Microsoft and auto-load file
  useEffect(() => {
    const isConnected = accounts.length > 0;
    setOneDriveConnected(isConnected);
    
    // Auto-load file when user signs in
    if (isConnected && !hasLoadedFile) {
      handleAutoLoadFile();
    }
  }, [accounts, hasLoadedFile, handleAutoLoadFile]);

  // Handle Microsoft sign-in
  const handleSignIn = async () => {
    try {
      await instance.loginPopup(loginRequest);
      toast.success('Signed in to Microsoft successfully!');
    } catch (error) {
      console.error('Sign-in error:', error);
      toast.error('Failed to sign in to Microsoft');
    }
  };

  // Handle Microsoft sign-out
  const handleSignOut = async () => {
    try {
      await instance.logoutPopup();
      setOneDriveConnected(false);
      setHasLoadedFile(false);
      setSpreadsheetData([]);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out');
    }
  };

  // Refresh data from OneDrive
  const handleRefreshFromOneDrive = useCallback(async () => {
    try {
      const data = await loadExcelData(FIXED_FILE_ID, oneDriveWorksheet);
      if (!data) return;

      // Convert to spreadsheet format
      const formattedData: Matrix<CellBase<any>> = data.map((row, rowIndex) => 
        (row || []).map((cell, colIndex) => ({
          value: cell ?? '',
          readOnly: rowIndex === 0 || colIndex === 0
        }))
      );

      setSpreadsheetData(formattedData);
      toast.success('Data refreshed from OneDrive');
    } catch (error) {
      console.error('Error refreshing from OneDrive:', error);
    }
  }, [FIXED_FILE_ID, oneDriveWorksheet, loadExcelData]);

  // Save data to OneDrive
  const handleSaveToOneDrive = useCallback(async () => {
    if (!oneDriveConnected) {
      toast.error('Please sign in to OneDrive first');
      return;
    }

    // Convert spreadsheet data to values array
    const values = spreadsheetData.map(row => 
      row.map(cell => cell?.value ?? '')
    );

    const success = await saveExcelData(FIXED_FILE_ID, values, oneDriveWorksheet);
    if (success) {
      toast.success('Data saved to OneDrive successfully');
    }
  }, [FIXED_FILE_ID, oneDriveWorksheet, spreadsheetData, saveExcelData, oneDriveConnected]);

  // Handle file upload (local)
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        const formattedData: Matrix<CellBase<any>> = jsonData.map((row, rowIndex) => 
          (row || []).map((cell, colIndex) => ({
            value: cell ?? '',
            readOnly: rowIndex === 0 || colIndex === 0
          }))
        );

        setSpreadsheetData(formattedData);
        toast.success('Excel file loaded successfully');
      } catch (error) {
        console.error('Error loading Excel file:', error);
        toast.error('Failed to load Excel file');
      }
    };

    reader.readAsBinaryString(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Export to Excel (local)
  const handleExportExcel = useCallback(() => {
    try {
      const exportData = spreadsheetData.map(row => 
        (row || []).map(cell => cell?.value ?? '')
      );

      const worksheet = XLSX.utils.aoa_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, selectedSection.name);

      const fileName = `${selectedSection.type}-data-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success('Data exported to Excel successfully');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel file');
    }
  }, [spreadsheetData, selectedSection]);

  // Handle section change
  const handleSectionChange = useCallback(async (sectionId: string) => {
    const section = sections.find(s => s.id.toString() === sectionId);
    if (section) {
      setSelectedSection(section);
      setSpreadsheetData(initializeCILData());
      setApprovalStatus('pending');
      setCurrentEntryId(null);
      toast.info(`Switched to ${section.name}`);
      
      // Load existing data entry for the new section
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const response = await getDataEntries(section.type, today);
        
        if (response && response.length > 0) {
          const entry = response[0];
          setCurrentEntryId(entry._id);
          setApprovalStatus(entry.status || 'pending');
          console.log('Loaded existing entry for section:', entry._id, 'Status:', entry.status);
        }
      } catch (error) {
        console.error('Error loading existing data entry for section:', error);
      }
    }
  }, []);

  // Open confirmation dialog
  const handleSubmit = () => {
    if (!oneDriveConnected) {
      toast.error('Please sign in to OneDrive to submit data');
      return;
    }
    
    const hasData = spreadsheetData.slice(1).some(row => 
      row.slice(1).some(cell => cell?.value !== '')
    );

    if (!hasData) {
      toast.error('Please enter at least some data before submitting');
      return;
    }

    setShowSubmitConfirmation(true);
  };

  // Submit data after confirmation
  const handleSubmitConfirm = async () => {
    setShowSubmitConfirmation(false);
    setIsSubmitting(true);
    
    try {

      // Transform spreadsheet data to match Angular format
      const CILobjectNames = [
        'SOLN Au (ppm)', 
        '% SOLIDS', 
        'pH', 
        'CN CONC (ppm)', 
        'DO (mg/L)', 
        'CAR CONC (g/L)'
      ];

      const crushingObjectNames = [
        'WEIGHTOMETER READING',
        'TONNES CRUSHED',
        'COMMENTS',
      ];

      let objectNames: string[] = [];
      if (selectedSection.type === 'cil') {
        objectNames = CILobjectNames;
      } else if (selectedSection.type === 'crushing') {
        objectNames = crushingObjectNames;
      }

      // Build data object matching Angular implementation
      const data: { [key: string]: { values: { time: string; value: string | number }[] } } = {};
      
      objectNames.forEach((objectName, colIndex) => {
        data[objectName] = { values: [] };
        
        // Iterate through data rows (skip header row)
        spreadsheetData.slice(1).forEach((row, rowIndex) => {
          const timeCell = row[0]; // First column is time
          const valueCell = row[1 + colIndex]; // Data columns start at index 1
          
          const time = timeCell?.value?.toString() || '';
          const cellValue = valueCell?.value;
          
          if (cellValue !== null && cellValue !== undefined && cellValue !== '') {
            data[objectName].values.push({
              time,
              value: objectName === 'COMMENTS' ? cellValue.toString() : Number(cellValue)
            });
          }
        });
      });

      // Save to OneDrive first
      const values = spreadsheetData.map(row => 
        row.map(cell => cell?.value ?? '')
      );
      
      const success = await saveExcelData(FIXED_FILE_ID, values, oneDriveWorksheet);
      if (!success) {
        toast.error('Failed to save data to OneDrive');
        setIsSubmitting(false);
        return;
      }

      // Submit to backend API
      const response = await submitDataEntry(employeeId, selectedSection.type, data);
      
      // Store the entry ID from the response
      if (response && response._id) {
        setCurrentEntryId(response._id);
        console.log('Stored entry ID:', response._id);
      }
      
      setApprovalStatus('pending');
      toast.success('Data submitted and saved to OneDrive successfully! Awaiting supervisor approval.');
    } catch (error: any) {
      console.error('Error submitting data:', error);
      toast.error(error.message || 'Failed to submit data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve data
  const handleApprove = async () => {
    if (!currentEntryId) {
      toast.error('No data entry found to approve. Please submit data first.');
      return;
    }
    
    if (!oneDriveConnected) {
      toast.error('Please sign in to OneDrive to approve data');
      return;
    }
    
    setIsApproving(true);
    
    try {
      // Save current spreadsheet data to OneDrive
      const values = spreadsheetData.map(row => 
        row.map(cell => cell?.value ?? '')
      );
      
      const success = await saveExcelData(FIXED_FILE_ID, values, oneDriveWorksheet);
      if (!success) {
        toast.error('Failed to save approved data to OneDrive');
        setIsApproving(false);
        return;
      }
      
      // Call backend API to approve the data entry
      await approveDataEntry(currentEntryId, 'approved', employeeId);
      
      // Update local status
      setApprovalStatus('approved');
      toast.success('Data approved and saved to database successfully!');
    } catch (error: any) {
      console.error('Error approving data:', error);
      toast.error(error.message || 'Failed to approve data');
    } finally {
      setIsApproving(false);
    }
  };

  // Reject data
  const handleReject = async () => {
    if (!currentEntryId) {
      toast.error('No data entry found to reject.');
      return;
    }
    
    setIsRejecting(true);
    
    try {
      // Call backend API to reject the data entry (set status to 'pending')
      await approveDataEntry(currentEntryId, 'pending', employeeId);
      
      setApprovalStatus('pending');
      toast.error('Data rejected. Status returned to pending.');
    } catch (error: any) {
      console.error('Error rejecting data:', error);
      toast.error(error.message || 'Failed to reject data');
    } finally {
      setIsRejecting(false);
    }
  };

  // Refresh data from OneDrive
  const handleClearAll = () => {
    if (oneDriveConnected) {
      handleRefreshFromOneDrive();
    } else {
      toast.info('Please sign in to load data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-lg font-medium">Loading spreadsheet data...</p>
          </div>
        </div>
      )}

      {/* Header with Status and Controls */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              {onBack && (
                <Button
                  onClick={onBack}
                  variant="ghost"
                  className="hover:bg-accent"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                 
                </Button>
              )}
              <h2 className="text-xl font-semibold">Metallurgical Data Entry</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {userRole === 'operator' 
                ? 'Enter hourly metallurgical process parameters'
                : 'Review, edit, and approve metallurgical data entries'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* OneDrive Connection Status */}
            {oneDriveConnected ? (
              <>
                <Badge 
                  variant="outline"
                  className="px-3 py-1 bg-blue-500/20 text-blue-500 border-blue-500/30"
                >
                  <Cloud className="h-3 w-3 mr-1" />
                  OneDrive Connected
                </Badge>
                <Button
                  onClick={handleRefreshFromOneDrive}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
                <Button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  size="sm"
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/10"
                >
                  <CloudOff className="h-3 w-3 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : null}

            <Badge 
              variant="secondary"
              className={`px-3 py-1 ${
                approvalStatus === 'approved' 
                  ? 'bg-mining-optimal/20 text-mining-optimal border-mining-optimal/30' 
                  : approvalStatus === 'rejected'
                  ? 'bg-mining-critical/20 text-mining-critical border-mining-critical/30'
                  : 'bg-mining-caution/20 text-mining-caution border-mining-caution/30'
              }`}
            >
              {approvalStatus === 'approved' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : approvalStatus === 'rejected' ? (
                <XCircle className="h-3 w-3 mr-1" />
              ) : (
                <Clock className="h-3 w-3 mr-1" />
              )}
              {approvalStatus === 'approved' ? 'Approved' : approvalStatus === 'rejected' ? 'Rejected' : 'Pending Approval'}
            </Badge>
            
            {userRole === 'supervisor' && (
              <div className="flex items-center space-x-2">
                {(approvalStatus === 'pending' || approvalStatus === 'rejected') && (
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving || isRejecting}
                    size="sm"
                    className="bg-mining-optimal hover:bg-mining-optimal/90 text-white"
                  >
                    {isApproving ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div>
                        <span>Approving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="h-3 w-3" />
                        <span>Approve</span>
                      </div>
                    )}
                  </Button>
                )}
                
                {approvalStatus === 'approved' && (
                  <Button
                    onClick={handleReject}
                    disabled={isRejecting || isApproving}
                    size="sm"
                    variant="destructive"
                    className="bg-mining-critical hover:bg-mining-critical/90 text-white"
                  >
                    {isRejecting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></div>
                        <span>Rejecting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-3 w-3" />
                        <span>Reject</span>
                      </div>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>


        {/* Section Selector and File Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 gap-3">
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium">Section:</label>
            <Select value={selectedSection.id.toString()} onValueChange={handleSectionChange}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sections.map(section => (
                  <SelectItem key={section.id} value={section.id.toString()}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Upload className="h-3 w-3 mr-1" />
              Load Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={isLoading}
            >
              <Download className="h-3 w-3 mr-1" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading}
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Card or Sign-in Prompt */}
      {!oneDriveConnected ? (
        <Card className="border-border">
          <CardContent className="p-12 flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-3">
              <FileSpreadsheet className="h-16 w-16 text-muted-foreground mx-auto" />
              <h3 className="text-xl font-semibold">Sign in to View Test File</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Please sign in to your Microsoft account to access the metallurgical data entry spreadsheet.
              </p>
            </div>
            <Button
              onClick={handleSignIn}
              size="lg"
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Cloud className="h-4 w-4 mr-2" />
              Sign in to View Test File
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <span>Process Data Sheet - {selectedSection.name}</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-4 bg-black">
            <div className="spreadsheet-container">
              <div className="spreadsheet-wrapper">
                <Spreadsheet
                  data={spreadsheetData}
                  onChange={setSpreadsheetData}
                  className="custom-spreadsheet"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button - Only for Operators */}
      {userRole === 'operator' && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || approvalStatus === 'approved'}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Submit Data</span>
              </div>
            )}
          </Button>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitConfirmation} onOpenChange={setShowSubmitConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Data Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit this data? The data will be saved to OneDrive and sent for supervisor approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitConfirm}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Instructions */}
      <Card className="border-border bg-muted/20">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              <span>
                {userRole === 'operator' ? 'Data Entry Instructions' : 'Supervisor Review Instructions'}
              </span>
            </h4>
            {userRole === 'operator' ? (
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Sign in to Microsoft to access the test file</li>
                <li>The test file will load automatically after sign-in</li>
                <li>Select the appropriate section (CIL, Crushing, or SAG Mill)</li>
                <li>Enter metallurgical parameters for each hourly time slot</li>
                <li>Time slots are automatically generated based on current shift (12-hour periods)</li>
                <li>Click "Submit Data" to save your entries to OneDrive and send for approval</li>
                <li>Data is automatically saved to OneDrive when you submit</li>
                <li>Submitted data awaits supervisor approval</li>
                <li className="text-amber-600 dark:text-amber-500 font-medium">⚠️ Important: Close the file in Excel before submitting to avoid lock errors</li>
              </ul>
            ) : (
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Sign in to Microsoft to access the test file</li>
                <li>Review and edit metallurgical data entries from operators</li>
                <li>Verify data accuracy and make corrections directly in the spreadsheet</li>
                <li>Use "Approve" button to validate and save approved data to OneDrive</li>
                <li>Approved data is automatically saved to the OneDrive file</li>
                <li>Use "Reject" button to return data to pending status</li>
                <li>Export approved data to Excel for further analysis or reporting</li>
                <li className="text-amber-600 dark:text-amber-500 font-medium">⚠️ Important: Close the file in Excel before approving to avoid lock errors</li>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Styles for Spreadsheet */}
      <style>{`
        .spreadsheet-container {
          width: 100%;
          overflow: visible;
          background-color: #000000;
        }
        .spreadsheet-wrapper {
          position: relative;
          display: block;
          box-sizing: border-box;
          overflow: auto !important;
          overflow-x: auto !important;
          overflow-y: auto !important;
          max-height: 600px;
          width: 100%;
          border: 1px solid hsl(var(--border));
          border-radius: 0.375rem;
          background-color: #000000;
        }
        .spreadsheet-wrapper::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }
        .spreadsheet-wrapper::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 6px;
        }
        .spreadsheet-wrapper::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 6px;
        }
        .spreadsheet-wrapper::-webkit-scrollbar-thumb:hover {
          background: #606060;
        }
        .spreadsheet-wrapper::-webkit-scrollbar-corner {
          background: #000000;
        }
        .Spreadsheet {
          background-color: #000000;
          color: #ffffff;
        }
        .Spreadsheet__cell.Spreadsheet__cell--selected {
          background-color: #000000 !important;
        }
        .Spreadsheet__cell.Spreadsheet__cell--selected input {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
        .custom-spreadsheet {
          font-size: 14px;
          display: inline-block;
          min-width: 100%;
        }
        .custom-spreadsheet table {
          border-collapse: collapse;
          width: auto;
          table-layout: auto;
        }
        .custom-spreadsheet th,
        .custom-spreadsheet td {
          border: 2px solid hsl(var(--border) / 0.8);
          padding: 8px;
          min-width: 120px;
          max-width: 200px;
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .custom-spreadsheet th,
          .custom-spreadsheet td {
            min-width: 80px;
            padding: 6px;
            font-size: 12px;
          }
        }
        .custom-spreadsheet th {
          background-color: #000000;
          color: #ffffff;
          font-weight: 600;
          text-align: center;
        }
        .custom-spreadsheet td {
          background-color: #000000;
          color: #ffffff;
        }
        .custom-spreadsheet td[data-read-only="true"] {
          background-color: #1a1a1a;
          color: #cccccc;
        }
        .custom-spreadsheet input {
          width: 100%;
          border: none;
          background: transparent;
          color: #ffffff !important;
          text-align: center;
          padding: 4px;
        }
        .custom-spreadsheet input:focus {
          outline: 2px solid hsl(var(--primary));
          outline-offset: -2px;
          background-color: #000000 !important;
          color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
