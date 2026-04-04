// Simulated cryptographic utilities for the MSAS demo

export async function sha256Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simulated AES encryption (visual demo using base64)
export function simulateAESEncrypt(plaintext: string): { ciphertext: string; key: string } {
  const key = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const ciphertext = btoa(plaintext.split('').map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join(''));
  return { ciphertext, key };
}

export function simulateAESDecrypt(ciphertext: string, key: string): string {
  const decoded = atob(ciphertext);
  return decoded.split('').map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
}

// Simulated RSA key pair (visual demo)
export function generateRSAKeyPair(): { publicKey: string; privateKey: string } {
  const pub = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  const priv = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return {
    publicKey: `-----BEGIN PUBLIC KEY-----\n${pub}\n-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----\n${priv}\n-----END PRIVATE KEY-----`,
  };
}

export type Role = 'admin' | 'user';

export interface User {
  username: string;
  passwordHash: string;
  role: Role;
  failedAttempts: number;
  locked: boolean;
}

export interface AuthToken {
  token: string;
  username: string;
  role: Role;
  issuedAt: number;
  expiresAt: number;
}

export interface LogEntry {
  timestamp: Date;
  event: string;
  username?: string;
  status: 'success' | 'warning' | 'error' | 'info';
}
