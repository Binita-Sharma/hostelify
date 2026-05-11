// JWT Token and Cookie Management Utilities

// Simple JWT-like token generation (for demo purposes)
// In production, use proper JWT library
export const generateToken = (user) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const payload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiration
  };
  
  // Simple encoding (not secure for production!)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${import.meta.env.VITE_JWT_SECRET || 'secret'}`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Decode and verify token
export const verifyToken = (token) => {
  if (!token) return null;
  
  try {
    const [header, payload, signature] = token.split('.');
    
    // Verify basic structure
    if (!header || !payload || !signature) return null;
    
    // Decode payload
    const decodedPayload = JSON.parse(atob(payload));
    
    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }
    
    return decodedPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Cookie management utilities
export const setAuthCookie = (token) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (24 * 60 * 60 * 1000)); // 24 hours
  
  document.cookie = `authToken=${token}; expires=${expires.toUTCString()}; path=/; secure=${window.location.protocol === 'https:'}; sameSite=strict`;
};

export const getAuthCookie = () => {
  const name = 'authToken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return null;
};

export const removeAuthCookie = () => {
  document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// Check if user is authenticated from cookie
export const isAuthenticated = () => {
  const token = getAuthCookie();
  return verifyToken(token) !== null;
};

// Get user data from token
export const getUserFromToken = () => {
  const token = getAuthCookie();
  return verifyToken(token);
};
