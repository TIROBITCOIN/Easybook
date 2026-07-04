import {
  BACKUP_KDF_ITERATIONS,
  EASYBOOK_BACKUP_APP,
  EASYBOOK_BACKUP_SCHEMA_VERSION,
  type BackupData,
  type EncryptedBackupFile
} from './backupTypes';
import { validateDecryptedBackupData } from './backupValidation';

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function deriveAesKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations,
      hash: 'SHA-256'
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptBackupPayload(
  data: BackupData,
  password: string,
  exportedAt = new Date().toISOString()
): Promise<EncryptedBackupFile> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveAesKey(password, salt, BACKUP_KDF_ITERATIONS);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    textEncoder.encode(JSON.stringify(data))
  );

  return {
    app: EASYBOOK_BACKUP_APP,
    schemaVersion: EASYBOOK_BACKUP_SCHEMA_VERSION,
    exportedAt,
    backupType: 'encrypted',
    crypto: {
      algorithm: 'AES-GCM',
      kdf: 'PBKDF2',
      hash: 'SHA-256',
      iterations: BACKUP_KDF_ITERATIONS,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv)
    },
    payload: bytesToBase64(new Uint8Array(encrypted))
  };
}

export async function decryptBackupPayload(
  backup: EncryptedBackupFile,
  password: string
): Promise<BackupData> {
  try {
    const salt = base64ToBytes(backup.crypto.salt);
    const iv = base64ToBytes(backup.crypto.iv);
    const payload = base64ToBytes(backup.payload);
    const key = await deriveAesKey(password, salt, backup.crypto.iterations);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(payload)
    );
    return validateDecryptedBackupData(JSON.parse(textDecoder.decode(decrypted)));
  } catch {
    throw new Error('백업 비밀번호가 올바르지 않거나 파일이 손상되었습니다.');
  }
}
