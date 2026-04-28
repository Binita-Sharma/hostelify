import CryptoJS from 'crypto-js';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'fallback-jwt-secret-2024';

export const generateJWT = (payload) => {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  
  const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
  const stringifiedPayload = CryptoJS.enc.Utf8.parse(JSON.stringify(payload));
  
  const encodedHeader = CryptoJS.enc.Base64url.stringify(stringifiedHeader);
  const encodedPayload = CryptoJS.enc.Base64url.stringify(stringifiedPayload);
  
  const signature = CryptoJS.HmacSHA256(encodedHeader + '.' + encodedPayload, JWT_SECRET);
  const encodedSignature = CryptoJS.enc.Base64url.stringify(signature);
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
};

export const verifyJWT = (token) => {
  try {
    const [header, payload, signature] = token.split('.');
    
    const expectedSignature = CryptoJS.HmacSHA256(header + '.' + payload, JWT_SECRET);
    const encodedExpectedSignature = CryptoJS.enc.Base64url.stringify(expectedSignature);
    
    if (encodedExpectedSignature !== signature) {
      return null;
    }
    
    const decodedPayload = CryptoJS.enc.Base64url.parse(payload).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

export const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  const secure = import.meta.env.PROD === 'true' ? '; Secure' : '';
  const sameSite = import.meta.env.PROD === 'true' ? '; SameSite=Strict' : '';
  
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/${secure}${sameSite}`;
};

export const getCookie = (name) => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};
