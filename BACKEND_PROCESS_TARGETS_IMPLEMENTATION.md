# Backend Implementation: Process Parameter Targets Management

## Overview
This document provides the requirements for implementing the backend API endpoints to support the Process Parameter Targets editing feature for supervisors.

## Feature Description
Supervisors can view and edit target values for all process parameters through a dedicated UI. These target values are used to determine if current parameter readings are within acceptable ranges (optimal, caution, or critical status).

## Required API Endpoints

### 1. GET /api/process-parameters/targets
**Purpose**: Retrieve all process parameter targets from the database

**Authentication**: Required (JWT token)

**Authorization**: All authenticated users can view targets

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response** (200 OK):
```json
{
  "success": true,
  "targets": [
    {
      "parameterId": "cyanide-cil-1",
      "parameterName": "Cyanide Level - CIL Tank 1",
      "targetValue": 3.0,
      "unit": "ppm",
      "updatedAt": "2024-11-05T21:00:00Z",
      "updatedBy": "supervisor@mines.com"
    },
    {
      "parameterId": "do-cil-1",
      "parameterName": "Dissolved Oxygen - CIL Tank 1",
      "targetValue": 8.0,
      "unit": "mg/L",
      "updatedAt": "2024-11-05T21:00:00Z",
      "updatedBy": "supervisor@mines.com"
    }
    // ... more parameters
  ]
}
```

**Error Responses**:
- 401 Unauthorized: Missing or invalid JWT token
- 500 Internal Server Error: Database or server error

---

### 2. POST /api/process-parameters/targets
**Purpose**: Update process parameter targets (bulk update)

**Authentication**: Required (JWT token)

**Authorization**: Only users with role 'supervisor' can update targets

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "targets": [
    {
      "parameterId": "cyanide-cil-1",
      "targetValue": 3.2
    },
    {
      "parameterId": "do-cil-1",
      "targetValue": 8.5
    },
    {
      "parameterId": "ph-cil-2",
      "targetValue": 11.2
    }
    // ... more parameters
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Process parameter targets updated successfully",
  "updatedCount": 3,
  "targets": [
    {
      "parameterId": "cyanide-cil-1",
      "targetValue": 3.2,
      "updatedAt": "2024-11-05T21:30:00Z"
    }
    // ... updated targets
  ]
}
```

**Error Responses**:
- 401 Unauthorized: Missing or invalid JWT token
- 403 Forbidden: User does not have supervisor role
- 400 Bad Request: Invalid request body or missing required fields
- 500 Internal Server Error: Database or server error

---

## Database Schema

### Collection/Table: `processParameterTargets`

**Fields**:
- `_id`: ObjectId (MongoDB) or auto-increment ID (SQL) - Primary key
- `parameterId`: String - Unique identifier for the parameter (e.g., "cyanide-cil-1")
- `parameterName`: String - Human-readable name (e.g., "Cyanide Level - CIL Tank 1")
- `targetValue`: Number - The target value for this parameter
- `unit`: String - Unit of measurement (e.g., "ppm", "mg/L", "°C")
- `updatedAt`: DateTime - Timestamp of last update
- `updatedBy`: String - Email or ID of the user who last updated this target
- `createdAt`: DateTime - Timestamp of creation

**Indexes**:
- Unique index on `parameterId`
- Index on `updatedAt` for sorting

**Example Document (MongoDB)**:
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "parameterId": "cyanide-cil-1",
  "parameterName": "Cyanide Level - CIL Tank 1",
  "targetValue": 3.0,
  "unit": "ppm",
  "updatedAt": ISODate("2024-11-05T21:00:00Z"),
  "updatedBy": "supervisor@mines.com",
  "createdAt": ISODate("2024-10-01T10:00:00Z")
}
```

---

## Implementation Details

### Initial Data Seeding
The database should be seeded with default target values for the following parameters:

```javascript
const defaultTargets = [
  { parameterId: "cyanide-cil-1", parameterName: "Cyanide Level - CIL Tank 1", targetValue: 3.0, unit: "ppm" },
  { parameterId: "do-cil-1", parameterName: "Dissolved Oxygen - CIL Tank 1", targetValue: 8.0, unit: "mg/L" },
  { parameterId: "ph-cil-2", parameterName: "pH Level - CIL Tank 2", targetValue: 11.0, unit: "" },
  { parameterId: "temperature-elution", parameterName: "Elution Strip Temperature", targetValue: 100.0, unit: "°C" },
  { parameterId: "pressure-oxygen", parameterName: "Oxygen Injection Pressure", targetValue: 4.5, unit: "bar" },
  { parameterId: "flow-rate-cil", parameterName: "CIL Circuit Flow Rate", targetValue: 250, unit: "L/min" },
  { parameterId: "carbon-loading", parameterName: "Carbon Loading", targetValue: 3500, unit: "g/t" },
  { parameterId: "lime-consumption", parameterName: "Lime Consumption Rate", targetValue: 2.0, unit: "kg/t" }
];
```

### Business Logic

#### GET Endpoint Logic:
1. Verify JWT token and extract user information
2. Query database for all parameter targets
3. Sort by `parameterId` or `parameterName` for consistent ordering
4. Return targets array

#### POST Endpoint Logic:
1. Verify JWT token and extract user information
2. **Check if user role is 'supervisor'** - return 403 if not
3. Validate request body:
   - Ensure `targets` is an array
   - Ensure each target has `parameterId` and `targetValue`
   - Validate `targetValue` is a valid number
4. For each target in the request:
   - Use upsert operation (update if exists, insert if not)
   - Set `updatedAt` to current timestamp
   - Set `updatedBy` to current user's email/ID
5. Return success response with updated count

### Security Considerations
- **Authentication**: All endpoints require valid JWT token
- **Authorization**: Only supervisors can modify targets (POST endpoint)
- **Input Validation**: Validate all input data to prevent injection attacks
- **Audit Trail**: Track who updated targets and when (`updatedBy`, `updatedAt`)

### Error Handling
- Implement proper error handling for database operations
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Log errors for debugging

---

## Example Implementation (Node.js/Express with MongoDB)

```javascript
const express = require('express');
const router = express.Router();
const ProcessParameterTarget = require('../models/ProcessParameterTarget');
const { authenticateToken, requireSupervisor } = require('../middleware/auth');

// GET /api/process-parameters/targets
router.get('/targets', authenticateToken, async (req, res) => {
  try {
    const targets = await ProcessParameterTarget.find()
      .sort({ parameterId: 1 })
      .select('-__v');
    
    res.json({
      success: true,
      targets: targets
    });
  } catch (error) {
    console.error('Error fetching parameter targets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch parameter targets',
      error: error.message
    });
  }
});

// POST /api/process-parameters/targets
router.post('/targets', authenticateToken, requireSupervisor, async (req, res) => {
  try {
    const { targets } = req.body;
    
    // Validate request
    if (!Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: targets must be a non-empty array'
      });
    }
    
    // Validate each target
    for (const target of targets) {
      if (!target.parameterId || typeof target.targetValue !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Invalid target: parameterId and targetValue are required'
        });
      }
    }
    
    // Update targets
    const updatedTargets = [];
    for (const target of targets) {
      const updated = await ProcessParameterTarget.findOneAndUpdate(
        { parameterId: target.parameterId },
        {
          targetValue: target.targetValue,
          updatedAt: new Date(),
          updatedBy: req.user.email
        },
        { new: true, upsert: true }
      );
      updatedTargets.push(updated);
    }
    
    res.json({
      success: true,
      message: 'Process parameter targets updated successfully',
      updatedCount: updatedTargets.length,
      targets: updatedTargets
    });
  } catch (error) {
    console.error('Error updating parameter targets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update parameter targets',
      error: error.message
    });
  }
});

module.exports = router;
```

### Mongoose Model Example

```javascript
const mongoose = require('mongoose');

const processParameterTargetSchema = new mongoose.Schema({
  parameterId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  parameterName: {
    type: String,
    required: true
  },
  targetValue: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  updatedBy: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProcessParameterTarget', processParameterTargetSchema);
```

### Middleware Example

```javascript
// requireSupervisor middleware
function requireSupervisor(req, res, next) {
  if (req.user.role !== 'supervisor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions. Only supervisors can update targets.'
    });
  }
  next();
}
```

---

## Testing Checklist

### GET Endpoint Tests:
- [ ] Returns 401 without authentication token
- [ ] Returns 200 with valid token
- [ ] Returns all parameter targets
- [ ] Targets are properly formatted
- [ ] Empty database returns empty array

### POST Endpoint Tests:
- [ ] Returns 401 without authentication token
- [ ] Returns 403 for non-supervisor users
- [ ] Returns 400 for invalid request body
- [ ] Returns 400 for missing required fields
- [ ] Returns 200 for valid supervisor request
- [ ] Updates existing targets correctly
- [ ] Creates new targets if they don't exist (upsert)
- [ ] Sets updatedAt and updatedBy fields correctly
- [ ] Handles bulk updates correctly
- [ ] Returns updated count and targets in response

---

## Integration Notes

The frontend expects:
1. The API to be available at `http://localhost:5000/api/process-parameters/targets`
2. JWT token to be sent in `Authorization: Bearer <token>` header
3. Response format to match the schemas defined above
4. Proper HTTP status codes for error handling

The frontend will:
- Fetch targets on component mount if user is a supervisor
- Display targets in an editable table
- Send bulk updates when supervisor clicks "Save Changes"
- Show success/error toasts based on API response
- Update local state with new target values on successful save
