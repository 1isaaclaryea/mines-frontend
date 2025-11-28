import { useState, useRef, useCallback } from 'react';
import Spreadsheet, { CellBase, Matrix } from 'react-spreadsheet';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { UserRole } from './LoginPage';
import { 
  Save, 
  Download, 
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  XCircle,
  FileSpreadsheet
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

interface DataEntryPanelProps {
  userRole: UserRole;
}

export function DataEntryPanel({ userRole }: DataEntryPanelProps) {
  const [selectedSection, setSelectedSection] = useState<Section>(sections[0]);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [spreadsheetData, setSpreadsheetData] = useState<Matrix<CellBase<any>>>(initializeCILData());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

        // Convert to spreadsheet format
        const formattedData: Matrix<CellBase<any>> = jsonData.map((row, rowIndex) => 
          (row || []).map((cell, colIndex) => ({
            value: cell ?? '',
            readOnly: rowIndex === 0 || colIndex === 0 // Make headers and time column readonly
          }))
        );

        setSpreadsheetData(formattedData);
        toast.success('Excel file loaded successfully');
      } catch (error) {
        console.error('Error loading Excel file:', error);
        toast.error('Failed to load Excel file');
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      toast.error('Error reading file');
      setIsLoading(false);
    };

    reader.readAsBinaryString(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Export to Excel
  const handleExportExcel = useCallback(() => {
    try {
      // Convert spreadsheet data to array format
      const exportData = spreadsheetData.map(row => 
        row.map(cell => cell?.value ?? '')
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
  const handleSectionChange = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id.toString() === sectionId);
    if (section) {
      setSelectedSection(section);
      setIsLoading(true);
      
      // Simulate loading section data
      setTimeout(() => {
        setSpreadsheetData(initializeCILData());
        setApprovalStatus('pending');
        setIsLoading(false);
        toast.info(`Loaded ${section.name}`);
      }, 500);
    }
  }, []);

  // Submit data
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate that data has been entered
      const hasData = spreadsheetData.slice(1).some(row => 
        row.slice(1).some(cell => cell?.value !== '')
      );

      if (!hasData) {
        toast.error('Please enter at least some data before submitting');
        setIsSubmitting(false);
        return;
      }

      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setApprovalStatus('pending');
      toast.success('Data submitted successfully! Awaiting supervisor approval.');
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve data
  const handleApprove = async () => {
    setIsApproving(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setApprovalStatus('approved');
      toast.success('Data approved successfully!');
    } catch (error) {
      console.error('Error approving data:', error);
      toast.error('Failed to approve data');
    } finally {
      setIsApproving(false);
    }
  };

  // Reject data
  const handleReject = async () => {
    setIsRejecting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setApprovalStatus('pending');
      toast.error('Data rejected. Status returned to pending.');
    } catch (error) {
      console.error('Error rejecting data:', error);
      toast.error('Failed to reject data');
    } finally {
      setIsRejecting(false);
    }
  };

  // Clear all data
  const handleClearAll = () => {
    setSpreadsheetData(initializeCILData());
    toast.info('All data cleared');
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
            <h2 className="text-xl font-semibold">Metallurgical Data Entry</h2>
            <p className="text-sm text-muted-foreground">
              {userRole === 'operator' 
                ? 'Enter hourly metallurgical process parameters'
                : 'Review, edit, and approve metallurgical data entries'
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
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

      {/* Spreadsheet Card */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <span>Process Data Sheet - {selectedSection.name}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4">
          <div className="spreadsheet-container w-full overflow-hidden">
            <div className="spreadsheet-wrapper border border-border rounded-md overflow-auto max-h-[600px]">
              <Spreadsheet
                data={spreadsheetData}
                onChange={setSpreadsheetData}
                className="custom-spreadsheet"
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
                <li>Select the appropriate section (CIL, Crushing, or SAG Mill)</li>
                <li>Load existing Excel files or enter data directly in the spreadsheet</li>
                <li>Enter metallurgical parameters for each hourly time slot</li>
                <li>Time slots are automatically generated based on current shift (12-hour periods)</li>
                <li>Export data to Excel for backup or offline editing</li>
                <li>Submit data for supervisor approval when complete</li>
              </ul>
            ) : (
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Review and edit metallurgical data entries from operators</li>
                <li>Load Excel files to review historical or external data</li>
                <li>Verify data accuracy and make corrections directly in the spreadsheet</li>
                <li>Use "Approve" button to validate and approve entries</li>
                <li>Use "Reject" button to return approved data back to pending status</li>
                <li>Export approved data to Excel for further analysis or reporting</li>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom Styles for Spreadsheet */}
      <style>{`
        .spreadsheet-container {
          contain: layout;
        }
        .spreadsheet-wrapper {
          position: relative;
          display: block;
          box-sizing: border-box;
        }
        .custom-spreadsheet {
          font-size: 14px;
          display: block;
        }
        .custom-spreadsheet table {
          border-collapse: collapse;
          width: max-content;
          min-width: 100%;
        }
        .custom-spreadsheet th,
        .custom-spreadsheet td {
          border: 1px solid hsl(var(--border));
          padding: 8px;
          min-width: 100px;
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
          background-color: hsl(var(--muted));
          font-weight: 600;
          text-align: center;
        }
        .custom-spreadsheet td {
          background-color: hsl(var(--background));
        }
        .custom-spreadsheet td[data-read-only="true"] {
          background-color: hsl(var(--muted) / 0.3);
          color: hsl(var(--muted-foreground));
        }
        .custom-spreadsheet input {
          width: 100%;
          border: none;
          background: transparent;
          color: hsl(var(--foreground)) !important;
          text-align: center;
          padding: 4px;
        }
        .custom-spreadsheet input:focus {
          outline: 2px solid hsl(var(--primary));
          outline-offset: -2px;
          background-color: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
        }
      `}</style>
    </div>
  );
}
