const encoder = new TextEncoder()
const decoder = new TextDecoder()
const ITERATIONS = 210_000

function bytesToBase64(bytes) {
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function base64ToBytes(value) {
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
  if (password.length < 10) throw new Error('Use uma senha com pelo menos 10 caracteres.')
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
  const backup = JSON.parse(content)
  if (backup?.format !== 'clientflow-encrypted-backup' || backup?.version !== 1) {
    throw new Error('Formato de backup inválido.')
  }
  const salt = base64ToBytes(backup.salt)
  const iv = base64ToBytes(backup.iv)
  const key = await deriveKey(password, salt)
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, base64ToBytes(backup.data))
  return JSON.parse(decoder.decode(decrypted))
}
