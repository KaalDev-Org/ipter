/**
 * JWT Token utilities for debugging and validation
 */

export interface JWTPayload {
  sub: string; // subject (username)
  role?: string;
  roles?: string[];
  iat: number; // issued at
  exp: number; // expiration
  [key: string]: any;
}

/**
 * Decode JWT token without verification (for debugging only)
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT has 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed for base64 decoding
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    const parsedPayload = JSON.parse(decodedPayload);
    
    return parsedPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

/**
 * Get token expiration time as Date
 */
export const getTokenExpiration = (token: string): Date | null => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }
  
  return new Date(payload.exp * 1000);
};

/**
 * Get user role from token
 */
export const getRoleFromToken = (token: string): string | null => {
  const payload = decodeJWT(token);
  if (!payload) {
    return null;
  }
  
  // Check for role field
  if (payload.role) {
    return payload.role;
  }
  
  // Check for roles array
  if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
    return payload.roles[0];
  }
  
  return null;
};

/**
 * Debug JWT token information
 */
export const debugToken = (token: string): void => {
  console.group('JWT Token Debug');
  
  const payload = decodeJWT(token);
  if (!payload) {
    console.error('Failed to decode token');
    console.groupEnd();
    return;
  }
  
  console.log('Token payload:', payload);
  console.log('Subject (username):', payload.sub);
  console.log('Role:', payload.role);
  console.log('Roles array:', payload.roles);
  console.log('Issued at:', new Date(payload.iat * 1000));
  console.log('Expires at:', new Date(payload.exp * 1000));
  console.log('Is expired:', isTokenExpired(token));
  console.log('Time until expiration:', Math.floor((payload.exp * 1000 - Date.now()) / 1000 / 60), 'minutes');
  
  console.groupEnd();
};
