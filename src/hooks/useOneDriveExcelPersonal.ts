import { useState, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface UseOneDriveExcelPersonalOptions {
  fileId?: string;
  worksheetName?: string;
}

/**
 * Hook for OneDrive Excel operations with personal Microsoft accounts
 * Uses download/upload approach instead of Graph API Excel endpoints
 */
export function useOneDriveExcelPersonal(options: UseOneDriveExcelPersonalOptions = {}) {
  const { instance, accounts } = useMsal();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Get access token
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      if (!accounts[0]) {
        toast.error('Please sign in to access OneDrive');
        return null;
      }

      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      return response.accessToken;
    } catch (error: any) {
      console.error('Error acquiring token:', error);
      
      if (error.name === 'InteractionRequiredAuthError') {
        try {
          const response = await instance.acquireTokenPopup(loginRequest);
          return response.accessToken;
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
   * Download Excel file from OneDrive
   */
  const downloadExcelFile = useCallback(async (fileId: string): Promise<Blob | null> => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) return null;

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      toast.error('Failed to download Excel file from OneDrive');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  /**
   * Upload Excel file to OneDrive with retry logic for locked files
   */
  const uploadExcelFile = useCallback(async (fileId: string, blob: Blob, retries: number = 3): Promise<boolean> => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) return false;

      for (let attempt = 0; attempt < retries; attempt++) {
        const response = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
            body: blob,
          }
        );

        if (response.ok) {
          toast.success('File uploaded to OneDrive successfully');
          return true;
        }

        // Handle 423 Locked error
        if (response.status === 423) {
          if (attempt < retries - 1) {
            toast.info(`File is locked, retrying... (${attempt + 1}/${retries - 1})`);
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          } else {
            toast.error('File is locked. Please close the file in Excel and try again.');
            throw new Error('File is locked by another process. Please close the file in Excel Online or desktop app and try again.');
          }
        }

        // Other errors
        throw new Error(`Failed to upload file: ${response.status} ${response.statusText}`);
      }

      return false;
    } catch (error: any) {
      console.error('Error uploading Excel file:', error);
      
      // Show user-friendly error message
      if (error.message?.includes('locked')) {
        toast.error('File is locked. Close it in Excel and try again.');
      } else {
        toast.error('Failed to upload Excel file to OneDrive');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  /**
   * Load Excel data from OneDrive (download and parse)
   */
  const loadExcelData = useCallback(async (
    fileId: string,
    worksheetName?: string
  ): Promise<any[][] | null> => {
    setIsLoading(true);
    try {
      const blob = await downloadExcelFile(fileId);
      if (!blob) return null;

      // Read the blob as array buffer
      const arrayBuffer = await blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Get the specified worksheet or first one
      const sheetName = worksheetName || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        toast.error(`Worksheet "${sheetName}" not found`);
        return null;
      }

      // Convert to JSON array
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      toast.success('Excel data loaded from OneDrive');
      return data;
    } catch (error) {
      console.error('Error loading Excel data:', error);
      toast.error('Failed to load Excel data from OneDrive');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [downloadExcelFile]);

  /**
   * Save Excel data to OneDrive (convert to Excel and upload)
   */
  const saveExcelData = useCallback(async (
    fileId: string,
    data: any[][],
    worksheetName: string = 'Sheet1'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);

      // Convert to blob
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      // Upload to OneDrive
      const success = await uploadExcelFile(fileId, blob);
      return success;
    } catch (error) {
      console.error('Error saving Excel data:', error);
      toast.error('Failed to save data to OneDrive');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [uploadExcelFile]);

  /**
   * Get file by path
   */
  const getFileByPath = useCallback(async (path: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) return null;

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/root:/${path}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get file: ${response.statusText}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error getting file by path:', error);
      toast.error('Failed to find file in OneDrive');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  /**
   * Get file ID from OneDrive share link
   */
  const getFileFromShareLink = useCallback(async (shareUrl: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) return null;

      // Encode the share URL for Microsoft Graph API
      const base64Value = btoa(shareUrl);
      const encodedUrl = base64Value
        .replace(/=+$/, '')
        .replace(/\//g, '_')
        .replace(/\+/g, '-');

      console.log('Attempting to decode share link...');
      console.log('Encoded URL:', encodedUrl);

      const response = await fetch(
        `https://graph.microsoft.com/v1.0/shares/u!${encodedUrl}/driveItem`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Share link error response:', errorData);
        
        if (response.status === 403) {
          toast.error('Permission denied. Sign out and sign in again to grant "Sites.Read.All" permission.');
        } else if (response.status === 401) {
          toast.error('Authentication failed. Please sign in again.');
        } else if (response.status === 404) {
          toast.error('Share link not found or expired. Please verify the link.');
        } else {
          toast.error(`Failed to get file from share link: ${response.status} ${response.statusText}`);
        }
        
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('File retrieved from share link:', data.id);
      toast.success('File ID retrieved from share link');
      return data.id;
    } catch (error: any) {
      console.error('Error getting file from share link:', error);
      
      // If we haven't already shown a specific error, show a generic one
      if (!error.message?.includes('HTTP')) {
        toast.error('Failed to get file from share link. Check permissions and try again.');
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken]);

  return {
    isLoading,
    loadExcelData,
    saveExcelData,
    downloadExcelFile,
    uploadExcelFile,
    getFileByPath,
    getFileFromShareLink,
  };
}
