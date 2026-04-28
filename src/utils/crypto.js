import CryptoJS from 'crypto-js';

const SECRET_KEY = 'hostelify-secure-key-2024';

export const encryptPassword = (password) => {
  if (!password) return '';
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
};

export const decryptPassword = (encryptedPassword) => {
  if (!encryptedPassword) return '';
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const comparePasswords = (plainPassword, encryptedPassword) => {
  const decrypted = decryptPassword(encryptedPassword);
  return plainPassword === decrypted;
};
