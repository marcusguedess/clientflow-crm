const encoder = new TextEncoder()
const decoder = new TextDecoder()
const ITERATIONS = 210_000
const MAX_BACKUP_PAYLOAD_BYTES = 1_000_000

function bytesToBase64(bytes) {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function base64ToBytes(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new Error('Backup corrompido.')
  }
  const binary = atob(value)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptBackup(data, password) {
  if (password.length < 12) throw new Error('Use uma senha com pelo menos 12 caracteres.')
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(data)))

  return JSON.stringify({
    format: 'clientflow-encrypted-backup',
    version: 1,
    algorithm: 'AES-GCM-256',
    kdf: 'PBKDF2-SHA256',
    iterations: ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encrypted)),
  })
}

export async function decryptBackup(content, password) {
  if (content.length > MAX_BACKUP_PAYLOAD_BYTES) throw new Error('Arquivo de backup muito grande.')
  const backup = JSON.parse(content)
  if (backup?.format !== 'clientflow-encrypted-backup' || backup?.version !== 1) {
    throw new Error('Formato de backup inválido.')
  }
  if (backup.algorithm !== 'AES-GCM-256' || backup.kdf !== 'PBKDF2-SHA256' || backup.iterations !== ITERATIONS) {
    throw new Error('Parâmetros criptográficos incompatíveis.')
  }
  const salt = base64ToBytes(backup.salt)
  const iv = base64ToBytes(backup.iv)
  const encryptedData = base64ToBytes(backup.data)
  if (salt.length !== 16 || iv.length !== 12 || encryptedData.length < 16) {
    throw new Error('Backup corrompido.')
  }
  const key = await deriveKey(password, salt)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData)
  return JSON.parse(decoder.decode(decrypted))
}
