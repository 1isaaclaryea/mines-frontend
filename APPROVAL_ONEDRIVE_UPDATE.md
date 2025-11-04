# OneDrive Update Feature

## Overview
Both operator submission and supervisor approval now automatically update the OneDrive file with the data.

## How It Works

### When Operator Clicks "Submit Data"
1. **OneDrive Connection Check**: Verifies the operator is signed in to Microsoft
2. **Data Validation**: Checks that at least some data has been entered
3. **Data Conversion**: Converts the current spreadsheet data to values array
4. **Save to OneDrive**: Uploads the submitted data to the fixed OneDrive file
5. **Backend Submission**: Sends data to backend API for processing
6. **Status Update**: Updates the local approval status to "pending"
7. **User Feedback**: Shows success toast notification

### When Supervisor Clicks "Approve"
1. **OneDrive Connection Check**: Verifies the supervisor is signed in to Microsoft
2. **Data Conversion**: Converts the current spreadsheet data to values array
3. **Save to OneDrive**: Uploads the approved data to the fixed OneDrive file
4. **Status Update**: Updates the local approval status to "approved"
5. **User Feedback**: Shows success toast notification

### Implementation Details

#### File: `DataEntryPanelWithOneDrive.tsx`

**Updated `handleSubmit` function** (lines 289-378):
```typescript
const handleSubmit = async () => {
  // Check OneDrive connection
  if (!oneDriveConnected) {
    toast.error('Please sign in to OneDrive to submit data');
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Validate data
    const hasData = spreadsheetData.slice(1).some(row => 
      row.slice(1).some(cell => cell?.value !== '')
    );
    if (!hasData) {
      toast.error('Please enter at least some data before submitting');
      return;
    }
    
    // Convert spreadsheet data to values array
    const values = spreadsheetData.map(row => 
      row.map(cell => cell?.value ?? '')
    );
    
    // Save to OneDrive first
    const success = await saveExcelData(FIXED_FILE_ID, values, oneDriveWorksheet);
    if (!success) {
      toast.error('Failed to save data to OneDrive');
      return;
    }
    
    // Submit to backend API
    await submitDataEntry(employeeId, selectedSection.type, data);
    
    setApprovalStatus('pending');
    toast.success('Data submitted and saved to OneDrive successfully!');
  } catch (error) {
    console.error('Error submitting data:', error);
    toast.error('Failed to submit data');
  } finally {
    setIsSubmitting(false);
  }
};
```

**Updated `handleApprove` function** (lines 380-410):
```typescript
const handleApprove = async () => {
  // Check OneDrive connection
  if (!oneDriveConnected) {
    toast.error('Please sign in to OneDrive to approve data');
    return;
  }
  
  setIsApproving(true);
  
  try {
    // Convert spreadsheet data to values array
    const values = spreadsheetData.map(row => 
      row.map(cell => cell?.value ?? '')
    );
    
    // Save to OneDrive using the fixed file ID
    const success = await saveExcelData(FIXED_FILE_ID, values, oneDriveWorksheet);
    if (!success) {
      toast.error('Failed to save approved data to OneDrive');
      return;
    }
    
    // Update local approval status
    setApprovalStatus('approved');
    toast.success('Data approved and saved to OneDrive successfully!');
  } catch (error) {
    console.error('Error approving data:', error);
    toast.error('Failed to approve data');
  } finally {
    setIsApproving(false);
  }
};
```

### Key Features

✅ **Automatic Save on Submit**: Operator data is automatically saved to OneDrive when submitted
✅ **Automatic Save on Approve**: Approved data is automatically saved to OneDrive
✅ **Error Handling**: Proper error handling with user-friendly messages
✅ **Connection Check**: Ensures user is signed in before attempting to save
✅ **Loading State**: Shows loading indicator during the save process
✅ **Success Feedback**: Clear success/error notifications
✅ **Data Validation**: Checks for data before allowing submission

### User Experience

#### For Operators:
1. Sign in to Microsoft account
2. Enter data in the spreadsheet
3. Click "Submit Data" button
4. System automatically saves the data to OneDrive
5. Data is also sent to backend API
6. Receive confirmation that data was submitted and saved
7. Status changes to "Pending Approval"

#### For Supervisors:
1. Sign in to Microsoft account
2. Review the data in the spreadsheet
3. Make any necessary edits directly in the spreadsheet
4. Click "Approve" button
5. System automatically saves the approved data to OneDrive
6. Receive confirmation that data was approved and saved

### Technical Flow

```
User clicks "Approve"
    ↓
Check OneDrive connection
    ↓
Convert spreadsheet data to array
    ↓
Call saveExcelData() from useOneDriveExcelPersonal hook
    ↓
Download current file from OneDrive
    ↓
Create new workbook with updated data
    ↓
Upload updated file to OneDrive (PUT request)
    ↓
Update local approval status
    ↓
Show success notification
```

### API Calls

The `saveExcelData` function in `useOneDriveExcelPersonal.ts` performs:

1. **Create Workbook**: Uses `XLSX.utils.book_new()` to create a new workbook
2. **Add Worksheet**: Converts data array to worksheet using `XLSX.utils.aoa_to_sheet()`
3. **Generate Blob**: Writes workbook to binary blob
4. **Upload**: PUT request to `https://graph.microsoft.com/v1.0/me/drive/items/{fileId}/content`

### Limitations

⚠️ **Personal Accounts**: Worksheet locking is not available for personal Microsoft accounts
⚠️ **OneDrive for Business**: Full protection features require OneDrive for Business

### Future Enhancements

Potential improvements:
- Add approval timestamp to the spreadsheet
- Add supervisor name/ID to the file
- Create a separate "approved" copy of the file
- Implement version history tracking
- Add worksheet protection for OneDrive for Business accounts
