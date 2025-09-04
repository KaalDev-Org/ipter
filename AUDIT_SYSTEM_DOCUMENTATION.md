# New Audit Logging System Documentation

## Overview

The new audit logging system is a simplified, frontend-driven approach that replaces the complex review-based audit system. All audit events are now logged from the frontend when actions occur, providing better control and consistency.

## Architecture

### Backend Components

1. **AuditLog Entity** (`com.ipter.model.AuditLog`)
   - Simple structure with essential fields
   - No review-related complexity
   - Automatic timestamp generation

2. **AuditService** (`com.ipter.service.AuditService`)
   - Single method for creating audit logs
   - Admin-only methods for viewing and statistics
   - Security annotations for access control

3. **AuditController** (`com.ipter.controller.AuditController`)
   - POST `/audit/log` - Create audit log (authenticated users)
   - GET `/audit` - View all logs with pagination (admin only)
   - GET `/audit/statistics` - Get audit statistics (admin only)
   - Additional filtering endpoints for admin use

### Frontend Components

1. **AuditLogger Utility** (`frontend/src/utils/auditLogger.ts`)
   - Static methods for common audit actions
   - Automatic error handling (doesn't fail main operations)
   - Consistent audit event formatting

2. **Updated API** (`frontend/src/services/api.ts`)
   - Simplified audit interfaces
   - Single `createAuditLog` method
   - Removed all review-related methods

## Usage

### Frontend Audit Logging

```typescript
import { AuditLogger } from '../utils/auditLogger';

// Log user actions
await AuditLogger.logUserLogin('username');
await AuditLogger.logUserLogout('username');
await AuditLogger.logFailedLogin('username');

// Log project actions
await AuditLogger.logProjectCreation('Project Name', 'project-id', 'created-by');
await AuditLogger.logProjectUpdate('Project Name', 'project-id', 'updated-by');

// Log image actions
await AuditLogger.logImageUpload('Project Name', 'project-id', 'image-id', 'filename', 'uploaded-by');

// Log custom actions
await AuditLogger.logAction('CUSTOM_ACTION', 'Action details', 'EntityType', 'entity-id');
```

### Backend API

#### Create Audit Log
```http
POST /api/audit/log
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "USER_LOGIN",
  "entityType": "User",
  "entityId": "user-uuid",
  "details": "User 'admin' logged in successfully"
}
```

#### Get Audit Logs (Admin Only)
```http
GET /api/audit?page=0&size=20&sortBy=timestamp&sortDir=desc
Authorization: Bearer <admin-token>
```

#### Get Audit Statistics (Admin Only)
```http
GET /api/audit/statistics
Authorization: Bearer <admin-token>
```

## Database Schema

### audit_logs Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    action VARCHAR(200) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    details VARCHAR(2000),
    performed_by UUID REFERENCES users(id),
    timestamp TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500)
);
```

## Common Audit Actions

### User Actions
- `USER_LOGIN` - User successfully logged in
- `USER_LOGOUT` - User logged out
- `LOGIN_FAILED` - Failed login attempt
- `PASSWORD_CHANGED` - User changed password
- `PASSWORD_RESET` - Password was reset
- `USER_CREATED` - New user was created
- `USER_UPDATED` - User profile was updated
- `USER_STATUS_CHANGED` - User was activated/deactivated

### Project Actions
- `PROJECT_CREATED` - New project was created
- `PROJECT_UPDATED` - Project was updated
- `PROJECT_STATUS_CHANGED` - Project status changed
- `PDF_UPLOADED` - PDF file uploaded to project
- `MASTER_DATA_PROCESSED` - Master data was processed

### Image Actions
- `IMAGE_UPLOADED` - Image uploaded to project
- `IMAGE_PROCESSED` - Image was processed for data extraction
- `DATA_VALIDATED` - Extracted data was validated

### System Actions
- `CONFIGURATION_CHANGED` - System configuration changed
- `DATA_EXPORTED` - Data was exported
- `REPORT_GENERATED` - Report was generated
- `SECURITY_EVENT` - Security-related event occurred

## Migration from Old System

### Removed Components
- Complex review workflow
- ReviewStatus enum
- ReviewSession entity
- Bulk review operations
- Review statistics
- Automatic backend audit logging

### Benefits of New System
1. **Simplicity** - No complex review workflow
2. **Frontend Control** - Audit events logged when actions occur
3. **Consistency** - Standardized audit event format
4. **Performance** - Lighter database schema
5. **Maintainability** - Easier to understand and modify

## Security

- All audit log creation requires authentication
- Viewing audit logs requires admin privileges
- IP address and user agent automatically captured
- Audit logs are immutable (no update/delete operations)

## Error Handling

The AuditLogger utility includes automatic error handling:
- Failed audit logging doesn't break main operations
- Errors are logged to console for debugging
- Graceful degradation if audit service is unavailable

## Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing
1. Login/logout to verify user audit events
2. Create/update projects to verify project audit events
3. Check admin dashboard for audit statistics
4. Verify audit logs appear in admin view

## Future Enhancements

Potential improvements for the audit system:
1. Audit log retention policies
2. Audit log export functionality
3. Real-time audit event notifications
4. Advanced filtering and search
5. Audit log integrity verification
