import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';
import ExcelService from '../services/excelService';
import { toast } from 'sonner';

interface UseOneDriveExcelOptions {
  fileId?: string;
  worksheetName?: string;
}

export function useOneDriveExcel(options: UseOneDriveExcelOptions = {}) {
  const { instance, accounts } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [excelService, setExcelService] = useState<ExcelService | null>(null);

  /**
   * Get authenticated Excel service instance
   */
  const getExcelService = useCallback(async (): Promise<ExcelService | null> => {
    try {
      if (!accounts[0]) {
        toast.error('Please sign in to access OneDrive');
        return null;
      }

      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      const service = new ExcelService(response.accessToken);
      setExcelService(service);
      return service;
    } catch (error: any) {
      console.error('Error acquiring token:', error);
      
      // Handle token acquisition failure
      if (error.name === 'InteractionRequiredAuthError') {
        try {
          const response = await instance.acquireTokenPopup(loginRequest);
          const service = new ExcelService(response.accessToken);
          setExcelService(service);
          return service;
        } catch (popupError) {
          console.error('Error acquiring token via popup:', popupError);
          toast.error('Failed to authenticate with Microsoft');
          return null;
        }
      }
      
      toast.error('Failed to access OneDrive');
      return null;
    }
  }, [instance, accounts]);

  /**
   * Load Excel data from OneDrive
   */
  const loadExcelData = useCallback(async (
    fileId: string,
    worksheetName: string,
    range?: string
  ): Promise<any[][] | null> => {
    setIsLoading(true);
    try {
      const service = await getExcelService();
      if (!service) return null;

      const data = range
        ? await service.readExcelData(fileId, worksheetName, range)
        : await service.readWorksheet(fileId, worksheetName);

      toast.success('Excel data loaded from OneDrive');
      return data;
    } catch (error) {
      console.error('Error loading Excel data:', error);
      toast.error('Failed to load Excel data from OneDrive');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getExcelService]);

  /**
   * Save data to Excel in OneDrive
   */
  const saveExcelData = useCallback(async (
    fileId: string,
    worksheetName: string,
    range: string,
    values: any[][]
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const service = await getExcelService();
      if (!service) return false;

      await service.updateExcelData(fileId, worksheetName, range, values);
      toast.success('Data saved to OneDrive');
      return true;
    } catch (error) {
      console.error('Error saving Excel data:', error);
      toast.error('Failed to save data to OneDrive');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getExcelService]);

  /**
   * Approve data (add approval status and lock worksheet)
   */
  const approveData = useCallback(async (
    fileId: string,
    worksheetName: string,
    approvalCell: string = 'A1'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const service = await getExcelService();
      if (!service) return false;

      // Create session for multiple operations
      const sessionId = await service.createWorkbookSession(fileId);

      // Add approval status
      await service.addApprovalStatus(fileId, worksheetName, approvalCell, 'Approved');

      // Lock the worksheet
      await service.protectWorksheet(fileId, worksheetName, {
        allowFormatCells: false,
        allowInsertRows: false,
        allowDeleteRows: false,
      });

      // Close session
      await service.closeWorkbookSession(fileId, sessionId);

      toast.success('Data approved and worksheet locked');
      return true;
    } catch (error) {
      console.error('Error approving data:', error);
      toast.error('Failed to approve data');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getExcelService]);

  /**
   * Reject data (update status and unlock if needed)
   */
  const rejectData = useCallback(async (
    fileId: string,
    worksheetName: string,
    approvalCell: string = 'A1'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const service = await getExcelService();
      if (!service) return false;

      // Unprotect worksheet first (if protected)
      try {
        await service.unprotectWorksheet(fileId, worksheetName);
      } catch (e) {
        // Worksheet might not be protected, continue
        console.log('Worksheet not protected or already unprotected');
      }

      // Add rejection status
      await service.addApprovalStatus(fileId, worksheetName, approvalCell, 'Rejected');

      toast.success('Data rejected and worksheet unlocked');
      return true;
    } catch (error) {
      console.error('Error rejecting data:', error);
      toast.error('Failed to reject data');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getExcelService]);

  /**
   * Download Excel file from OneDrive
   */
  const downloadExcelFile = useCallback(async (
    fileId: string
  ): Promise<Blob | null> => {
    setIsLoading(true);
    try {
      const service = await getExcelService();
      if (!service) return null;

      const blob = await service.downloadExcelFile(fileId);
      return blob;
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      toast.error('Failed to download Excel file');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getExcelService]);

  /**
   * Get file by path
   */
  const getFileByPath = useCallback(async (
    path: string
  ): Promise<string | null> => {
    setIsLoading(true);
    try {
      const service = await getExcelService();
      if (!service) return null;

      const fileId = await service.getFileByPath(path);
      return fileId;
    } catch (error) {
      console.error('Error getting file by path:', error);
      toast.error('Failed to find file in OneDrive');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getExcelService]);

  return {
    isLoading,
    loadExcelData,
    saveExcelData,
    approveData,
    rejectData,
    downloadExcelFile,
    getFileByPath,
    getExcelService,
  };
}
