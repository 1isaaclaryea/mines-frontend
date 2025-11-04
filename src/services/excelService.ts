import { Client } from "@microsoft/microsoft-graph-client";

interface ExcelRange {
  values: any[][];
}

interface WorkbookSession {
  id: string;
  persistChanges: boolean;
}

interface ProtectionOptions {
  allowFormatCells?: boolean;
  allowFormatColumns?: boolean;
  allowFormatRows?: boolean;
  allowInsertColumns?: boolean;
  allowInsertRows?: boolean;
  allowInsertHyperlinks?: boolean;
  allowDeleteColumns?: boolean;
  allowDeleteRows?: boolean;
  allowSort?: boolean;
  allowAutoFilter?: boolean;
  allowPivotTables?: boolean;
}

class ExcelService {
  private client: Client;

  constructor(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Get file metadata by ID
   */
  async getFile(fileId: string) {
    try {
      const file = await this.client.api(`/me/drive/items/${fileId}`).get();
      return file;
    } catch (error) {
      console.error("Error getting file:", error);
      throw error;
    }
  }

  /**
   * Get file by path
   */
  async getFileByPath(path: string) {
    try {
      const response = await this.client.api(`/me/drive/root:/${path}`).get();
      return response.id;
    } catch (error) {
      console.error("Error getting file by path:", error);
      throw error;
    }
  }

  /**
   * Get file from shared link
   */
  async getFileFromSharedLink(shareUrl: string) {
    try {
      const base64Value = btoa(shareUrl);
      const encodedUrl = base64Value
        .replace(/=+$/, "")
        .replace(/\//g, "_")
        .replace(/\+/g, "-");

      const response = await this.client
        .api(`/shares/u!${encodedUrl}/driveItem`)
        .get();
      return response.id;
    } catch (error) {
      console.error("Error getting file from shared link:", error);
      throw error;
    }
  }

  /**
   * Extract resource ID from OneDrive share link (alternative for personal accounts)
   * Share link format: https://1drv.ms/x/c/{cid}/{resourceId}
   */
  extractResourceIdFromShareLink(shareUrl: string): { cid: string; resourceId: string } | null {
    try {
      // Parse OneDrive share link
      // Format: https://1drv.ms/x/c/cd9b8bbddc064ce4/ETC57QOscAdLkE3ooTGKaUABU7zBvuRiGPK9GGtAZO5QTw
      const match = shareUrl.match(/1drv\.ms\/[a-z]\/c\/([^\/]+)\/([^\?]+)/);
      if (match) {
        return {
          cid: match[1],
          resourceId: match[2]
        };
      }
      return null;
    } catch (error) {
      console.error("Error extracting resource ID from share link:", error);
      return null;
    }
  }

  /**
   * Get file from personal OneDrive using resource ID
   * Note: This requires the file to be in your own OneDrive
   */
  async getFileByResourceId(resourceId: string) {
    try {
      // Try to find the file by searching
      const response = await this.client
        .api(`/me/drive/root/search(q='${resourceId}')`)
        .get();
      
      if (response.value && response.value.length > 0) {
        return response.value[0].id;
      }
      
      throw new Error("File not found with resource ID");
    } catch (error) {
      console.error("Error getting file by resource ID:", error);
      throw error;
    }
  }

  /**
   * List worksheets in a workbook
   */
  async listWorksheets(fileId: string) {
    try {
      const response = await this.client
        .api(`/me/drive/items/${fileId}/workbook/worksheets`)
        .get();
      return response.value;
    } catch (error) {
      console.error("Error listing worksheets:", error);
      throw error;
    }
  }

  /**
   * Read data from Excel worksheet range
   */
  async readExcelData(
    fileId: string,
    worksheetName: string,
    range: string
  ): Promise<any[][]> {
    try {
      const response: ExcelRange = await this.client
        .api(
          `/me/drive/items/${fileId}/workbook/worksheets/${worksheetName}/range(address='${range}')`
        )
        .get();
      return response.values;
    } catch (error) {
      console.error("Error reading Excel data:", error);
      throw error;
    }
  }

  /**
   * Read entire worksheet
   */
  async readWorksheet(fileId: string, worksheetName: string): Promise<any[][]> {
    try {
      const response: ExcelRange = await this.client
        .api(
          `/me/drive/items/${fileId}/workbook/worksheets/${worksheetName}/usedRange`
        )
        .get();
      return response.values;
    } catch (error) {
      console.error("Error reading worksheet:", error);
      throw error;
    }
  }

  /**
   * Update Excel cells (for operator data entry)
   */
  async updateExcelData(
    fileId: string,
    worksheetName: string,
    range: string,
    values: any[][]
  ) {
    try {
      const response = await this.client
        .api(
          `/me/drive/items/${fileId}/workbook/worksheets/${worksheetName}/range(address='${range}')`
        )
        .patch({
          values: values,
        });
      return response;
    } catch (error) {
      console.error("Error updating Excel data:", error);
      throw error;
    }
  }

  /**
   * Update multiple ranges at once (batch operation)
   */
  async batchUpdateExcelData(
    fileId: string,
    worksheetName: string,
    updates: Array<{ range: string; values: any[][] }>
  ) {
    try {
      const sessionId = await this.createWorkbookSession(fileId);

      for (const update of updates) {
        await this.client
          .api(
            `/me/drive/items/${fileId}/workbook/worksheets/${worksheetName}/range(address='${update.range}')`
          )
          .header("workbook-session-id", sessionId)
          .patch({
            values: update.values,
          });
      }

      await this.closeWorkbookSession(fileId, sessionId);
    } catch (error) {
      console.error("Error batch updating Excel data:", error);
      throw error;
    }
  }

  /**
   * Add approval status to a specific cell
   */
  async addApprovalStatus(
    fileId: string,
    worksheetName: string,
    cellAddress: string,
    status: "Approved" | "Rejected" | "Pending" = "Approved"
  ) {
    try {
      const response = await this.client
        .api(
          `/me/drive/items/${fileId}/workbook/worksheets/${worksheetName}/range(address='${cellAddress}')`
        )
        .patch({
          values: [[status]],
          numberFormat: [["@"]], // Text format
        });
      return response;
    } catch (error) {
      console.error("Error adding approval status:", error);
      throw error;
    }
  }

  /**
   * Protect worksheet (lock for editing)
   */
  async protectWorksheet(
    fileId: string,
    worksheetName: string,
    options: ProtectionOptions = {}
  ) {
    try {
      const response = await this.client
        .api(
          `/me/drive/items/${fileId}/workbook/worksheets/${worksheetName}/protection/protect`
        )
        .post({
          options: {
            allowFormatCells: false,
            allowFormatColumns: false,
            allowFormatRows: false,
            allowInsertColumns: false,
            allowInsertRows: false,
            allowInsertHyperlinks: false,
            allowDeleteColumns: false,
            allowDeleteRows: false,
            allowSort: false,
            allowAutoFilter: false,
            allowPivotTables: false,
            ...options,
          },
        });
      return response;
    } catch (error) {
      console.error("Error protecting worksheet:", error);
      throw error;
    }
  }

  /**
   * Unprotect worksheet
   */
  async unprotectWorksheet(fileId: string, worksheetName: string) {
    try {
      const response = await this.client
        .api(
          `/me/drive/items/${fileId}/workbook/worksheets/${worksheetName}/protection/unprotect`
        )
        .post({});
      return response;
    } catch (error) {
      console.error("Error unprotecting worksheet:", error);
      throw error;
    }
  }

  /**
   * Create a workbook session for multiple operations (more efficient)
   */
  async createWorkbookSession(fileId: string): Promise<string> {
    try {
      const session: WorkbookSession = await this.client
        .api(`/me/drive/items/${fileId}/workbook/createSession`)
        .post({
          persistChanges: true,
        });
      return session.id;
    } catch (error) {
      console.error("Error creating workbook session:", error);
      throw error;
    }
  }

  /**
   * Close workbook session
   */
  async closeWorkbookSession(fileId: string, sessionId: string) {
    try {
      await this.client
        .api(`/me/drive/items/${fileId}/workbook/closeSession`)
        .header("workbook-session-id", sessionId)
        .post({});
    } catch (error) {
      console.error("Error closing workbook session:", error);
      throw error;
    }
  }

  /**
   * Download Excel file as blob
   */
  async downloadExcelFile(fileId: string): Promise<Blob> {
    try {
      const response = await this.client
        .api(`/me/drive/items/${fileId}/content`)
        .get();
      return response;
    } catch (error) {
      console.error("Error downloading Excel file:", error);
      throw error;
    }
  }

  /**
   * Upload/Replace Excel file content
   */
  async uploadExcelFile(fileId: string, content: Blob) {
    try {
      const response = await this.client
        .api(`/me/drive/items/${fileId}/content`)
        .put(content);
      return response;
    } catch (error) {
      console.error("Error uploading Excel file:", error);
      throw error;
    }
  }

  /**
   * Add a comment to a cell
   */
  async addComment(
    fileId: string,
    worksheetName: string,
    cellAddress: string,
    comment: string
  ) {
    try {
      const response = await this.client
        .api(
          `/me/drive/items/${fileId}/workbook/worksheets/${worksheetName}/range(address='${cellAddress}')/comment`
        )
        .post({
          content: comment,
        });
      return response;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }
}

export default ExcelService;
