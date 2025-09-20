import axios from 'axios';

// Create a separate axios instance for audit logging to avoid circular dependencies
const auditAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to audit requests (consistent with AuthContext using sessionStorage)
auditAPI.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface AuditLogRequest {
  action: string;
  entityType?: string;
  entityId?: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

interface MachineInfo {
  hash: string;
  mac: string;
  ip: string;
  name: string;
  os: string;
}

export class AuditLogger {
  private static machineInfo: MachineInfo | null = null;

  // Initialize machine info (called once on app start)
  static async initializeMachineInfo(): Promise<void> {
    try {
      // Generate a unique hash for this session/machine
      const sessionHash = this.generateSessionHash();
      
      // Get basic machine info
      this.machineInfo = {
        hash: sessionHash,
        mac: 'N/A', // Browser security doesn't allow MAC address access
        ip: await this.getClientIP(),
        name: navigator.platform || 'Unknown',
        os: this.getOperatingSystem()
      };
    } catch (error) {
      console.warn('Failed to initialize machine info:', error);
      this.machineInfo = {
        hash: this.generateSessionHash(),
        mac: 'N/A',
        ip: 'Unknown',
        name: navigator.platform || 'Unknown',
        os: this.getOperatingSystem()
      };
    }
  }

  private static generateSessionHash(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const userAgent = navigator.userAgent;
    const combined = `${timestamp}-${random}-${userAgent}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8).toUpperCase();
  }

  private static async getClientIP(): Promise<string> {
    try {
      // Try to get IP from a public service (fallback)
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private static getOperatingSystem(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows NT 10.0')) return 'Microsoft Windows NT 10.0';
    if (userAgent.includes('Windows NT 6.3')) return 'Microsoft Windows NT 8.1';
    if (userAgent.includes('Windows NT 6.2')) return 'Microsoft Windows NT 8.0';
    if (userAgent.includes('Windows NT 6.1')) return 'Microsoft Windows NT 7.0';
    if (userAgent.includes('Mac OS X')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown OS';
  }

  private static formatMachineInfo(): string {
    if (!this.machineInfo) return '';
    return `Machine info: Hash: ${this.machineInfo.hash}, MAC: ${this.machineInfo.mac}, IP: ${this.machineInfo.ip}, Name: ${this.machineInfo.name}, OS: ${this.machineInfo.os}`;
  }

  private static async createAuditLog(request: AuditLogRequest): Promise<void> {
    try {
      const enhancedRequest = {
        ...request,
        details: `${request.details}${this.machineInfo ? '\n' + this.formatMachineInfo() : ''}`,
        ipAddress: request.ipAddress || this.machineInfo?.ip || 'Unknown',
        userAgent: request.userAgent || navigator.userAgent
      };

      await auditAPI.post('/audit/log', enhancedRequest);
    } catch (error) {
      // Don't let audit logging failures break the main functionality
      console.warn('Audit logging failed:', error);
    }
  }

  // Authentication Actions
  static async logUserLogin(username: string, timezone?: string): Promise<void> {
    const details = `User '${username}' logged in successfully${timezone ? ` (${timezone})` : ''}`;
    await this.createAuditLog({
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  static async logUserLogout(username: string): Promise<void> {
    const details = `User '${username}' logged out`;
    await this.createAuditLog({
      action: 'USER_LOGOUT',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  static async logFailedLogin(username: string, reason?: string): Promise<void> {
    const details = `Failed login attempt for user '${username}'${reason ? `: ${reason}` : ''}`;
    await this.createAuditLog({
      action: 'LOGIN_FAILED',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  static async logPasswordVisibilityToggle(username: string, visible: boolean): Promise<void> {
    const details = `User '${username}' ${visible ? 'showed' : 'hid'} password on login form`;
    await this.createAuditLog({
      action: 'UI_INTERACTION',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  // Navigation Actions
  static async logNavigation(username: string, fromPage: string, toPage: string, method: 'click' | 'direct' = 'click'): Promise<void> {
    const details = `User '${username}' navigated from '${fromPage}' to '${toPage}' via ${method}`;
    await this.createAuditLog({
      action: 'NAVIGATION',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  static async logNavbarClick(username: string, navItem: string): Promise<void> {
    const details = `User '${username}' clicked navbar item: '${navItem}'`;
    await this.createAuditLog({
      action: 'UI_INTERACTION',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  static async logDropdownAction(username: string, action: string, item?: string): Promise<void> {
    const details = `User '${username}' ${action}${item ? ` '${item}'` : ''} in dropdown menu`;
    await this.createAuditLog({
      action: 'UI_INTERACTION',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  // User Management Actions
  static async logUserCreation(createdUsername: string, createdBy: string, role: string): Promise<void> {
    const details = `User '${createdBy}' created new user '${createdUsername}' with role '${role}'`;
    await this.createAuditLog({
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: createdUsername,
      details
    });
  }

  static async logUserUpdate(targetUsername: string, updatedBy: string, changes: string[]): Promise<void> {
    const details = `User '${updatedBy}' updated user '${targetUsername}'. Changes: ${changes.join(', ')}`;
    await this.createAuditLog({
      action: 'USER_UPDATED',
      entityType: 'User',
      entityId: targetUsername,
      details
    });
  }

  static async logUserStatusChange(targetUsername: string, changedBy: string, newStatus: string): Promise<void> {
    const details = `User '${changedBy}' changed status of user '${targetUsername}' to '${newStatus}'`;
    await this.createAuditLog({
      action: 'USER_STATUS_CHANGED',
      entityType: 'User',
      entityId: targetUsername,
      details
    });
  }

  static async logPasswordChange(username: string, changedBy: string, forced: boolean = false): Promise<void> {
    const details = `Password ${forced ? 'forcibly ' : ''}changed for user '${username}' by '${changedBy}'`;
    await this.createAuditLog({
      action: 'PASSWORD_CHANGED',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  // Project Management Actions
  static async logProjectCreation(projectName: string, projectId: string, createdBy: string): Promise<void> {
    const details = `User '${createdBy}' created new project '${projectName}' (ID: ${projectId})`;
    await this.createAuditLog({
      action: 'PROJECT_CREATED',
      entityType: 'Project',
      entityId: projectId,
      details
    });
  }

  static async logProjectUpdate(projectName: string, projectId: string, updatedBy: string, changes: string[]): Promise<void> {
    const details = `User '${updatedBy}' updated project '${projectName}' (ID: ${projectId}). Changes: ${changes.join(', ')}`;
    await this.createAuditLog({
      action: 'PROJECT_UPDATED',
      entityType: 'Project',
      entityId: projectId,
      details
    });
  }

  static async logPDFUpload(projectName: string, projectId: string, filename: string, uploadedBy: string): Promise<void> {
    const details = `User '${uploadedBy}' uploaded PDF '${filename}' to project '${projectName}' (ID: ${projectId})`;
    await this.createAuditLog({
      action: 'PDF_UPLOADED',
      entityType: 'Project',
      entityId: projectId,
      details
    });
  }

  static async logPDFProcessingStart(projectName: string, projectId: string, filename: string, initiatedBy: string): Promise<void> {
    const details = `User '${initiatedBy}' started PDF processing for '${filename}' in project '${projectName}' (ID: ${projectId})`;
    await this.createAuditLog({
      action: 'PDF_PROCESSING_STARTED',
      entityType: 'Project',
      entityId: projectId,
      details
    });
  }

  static async logPDFProcessingComplete(projectName: string, projectId: string, filename: string, extractedItems: number): Promise<void> {
    const details = `PDF processing completed for '${filename}' in project '${projectName}' (ID: ${projectId}). Extracted ${extractedItems} items`;
    await this.createAuditLog({
      action: 'PDF_PROCESSING_COMPLETED',
      entityType: 'Project',
      entityId: projectId,
      details
    });
  }

  static async logMasterDataProcessed(projectName: string, projectId: string, processedBy: string): Promise<void> {
    const details = `Master data processed for project '${projectName}' (ID: ${projectId}) by user '${processedBy}'`;
    await this.createAuditLog({
      action: 'MASTER_DATA_PROCESSED',
      entityType: 'Project',
      entityId: projectId,
      details
    });
  }

  // Image Upload and Processing Actions
  static async logImageUpload(projectName: string, projectId: string, imageNames: string[], uploadedBy: string): Promise<void> {
    const details = `User '${uploadedBy}' uploaded ${imageNames.length} image(s) to project '${projectName}' (ID: ${projectId}): ${imageNames.join(', ')}`;
    await this.createAuditLog({
      action: 'IMAGE_UPLOADED',
      entityType: 'Project',
      entityId: projectId,
      details
    });
  }

  static async logImageProcessingStart(projectName: string, projectId: string, imageName: string, initiatedBy: string): Promise<void> {
    const details = `User '${initiatedBy}' started image processing for '${imageName}' in project '${projectName}' (ID: ${projectId})`;
    await this.createAuditLog({
      action: 'IMAGE_PROCESSING_STARTED',
      entityType: 'Project',
      entityId: projectId,
      details
    });
  }

  static async logImageProcessingComplete(projectName: string, projectId: string, imageName: string, extractedData: any): Promise<void> {
    const gridLayout = extractedData.gridLayout || 'Unknown';
    const serialCount = extractedData.serialNumbers?.length || 0;
    const avgConfidence = extractedData.averageConfidence || 0;

    const details = `Image processing completed for '${imageName}' in project '${projectName}' (ID: ${projectId}). Grid: ${gridLayout}, Serials: ${serialCount}, Avg Confidence: ${avgConfidence.toFixed(2)}%`;
    await this.createAuditLog({
      action: 'IMAGE_PROCESSING_COMPLETED',
      entityType: 'Project',
      entityId: projectId,
      details
    });
  }

  static async logImageVerification(projectName: string, projectId: string, imageName: string, verifiedBy: string, action: string): Promise<void> {
    const details = `User '${verifiedBy}' ${action} image verification for '${imageName}' in project '${projectName}' (ID: ${projectId})`;
    await this.createAuditLog({
      action: 'IMAGE_VERIFIED',
      entityType: 'Project',
      entityId: projectId,
      details
    });
  }

  static async logDataValidation(projectName: string, projectId: string, validatedBy: string, validationType: string, results: any): Promise<void> {
    const matched = results.matched || 0;
    const unmatched = results.unmatched || 0;
    const duplicates = results.duplicates || 0;

    const details = `User '${validatedBy}' performed ${validationType} validation for project '${projectName}' (ID: ${projectId}). Results: ${matched} matched, ${unmatched} unmatched, ${duplicates} duplicates`;
    await this.createAuditLog({
      action: 'DATA_VALIDATED',
      entityType: 'Project',
      entityId: projectId,
      details
    });
  }

  // UI Interaction Actions
  static async logButtonClick(username: string, buttonName: string, page: string, context?: string): Promise<void> {
    const details = `User '${username}' clicked '${buttonName}' button on ${page}${context ? ` (${context})` : ''}`;
    await this.createAuditLog({
      action: 'UI_INTERACTION',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  static async logDialogAction(username: string, dialogName: string, action: string, context?: string): Promise<void> {
    const details = `User '${username}' ${action} '${dialogName}' dialog${context ? ` (${context})` : ''}`;
    await this.createAuditLog({
      action: 'UI_INTERACTION',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  static async logTabSwitch(username: string, fromTab: string, toTab: string, page: string): Promise<void> {
    const details = `User '${username}' switched from '${fromTab}' to '${toTab}' tab on ${page}`;
    await this.createAuditLog({
      action: 'UI_INTERACTION',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  static async logFormSubmission(username: string, formName: string, page: string, data?: any): Promise<void> {
    const details = `User '${username}' submitted '${formName}' form on ${page}${data ? ` with data: ${JSON.stringify(data)}` : ''}`;
    await this.createAuditLog({
      action: 'FORM_SUBMISSION',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  // API Call Actions
  static async logAPICall(username: string, method: string, endpoint: string, status: number, responseTime?: number): Promise<void> {
    const details = `User '${username}' made ${method} request to ${endpoint}. Status: ${status}${responseTime ? `, Response time: ${responseTime}ms` : ''}`;
    await this.createAuditLog({
      action: 'API_CALL',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  // System Actions
  static async logPageView(username: string, page: string, referrer?: string): Promise<void> {
    const details = `User '${username}' viewed page '${page}'${referrer ? ` from '${referrer}'` : ''}`;
    await this.createAuditLog({
      action: 'PAGE_VIEW',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  static async logSearchAction(username: string, searchTerm: string, page: string, results?: number): Promise<void> {
    const details = `User '${username}' searched for '${searchTerm}' on ${page}${results !== undefined ? ` (${results} results)` : ''}`;
    await this.createAuditLog({
      action: 'SEARCH_PERFORMED',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  static async logFilterAction(username: string, filterType: string, filterValue: string, page: string): Promise<void> {
    const details = `User '${username}' applied ${filterType} filter '${filterValue}' on ${page}`;
    await this.createAuditLog({
      action: 'FILTER_APPLIED',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  static async logExportAction(username: string, exportType: string, page: string, itemCount?: number): Promise<void> {
    const details = `User '${username}' exported ${exportType} from ${page}${itemCount ? ` (${itemCount} items)` : ''}`;
    await this.createAuditLog({
      action: 'DATA_EXPORTED',
      entityType: 'User',
      entityId: username,
      details
    });
  }

  // Custom Action Logger
  static async logCustomAction(action: string, username: string, entityType: string, entityId: string, details: string): Promise<void> {
    await this.createAuditLog({
      action,
      entityType,
      entityId,
      details: `User '${username}' ${details}`
    });
  }
}
