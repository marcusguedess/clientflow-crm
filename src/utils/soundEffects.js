let audioContext

function getContext() {
  audioContext ||= new AudioContext()
  return audioContext
}

function tone(frequency, duration, delay = 0, type = 'sine', volume = 0.035) {
  const context = getContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0, context.currentTime + delay)
  gain.gain.linearRampToValueAtTime(volume, context.currentTime + delay + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + delay + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(context.currentTime + delay)
  oscillator.stop(context.currentTime + delay + duration)
}

export function playSound(name, enabled = true) {
  if (!enabled) return
  try {
    if (name === 'attention') {
      tone(660, 0.12, 0, 'square')
      tone(880, 0.18, 0.13, 'square')
    } else if (name === 'success') {
      tone(523, 0.12)
      tone(659, 0.12, 0.1)
      tone(784, 0.2, 0.2)
    } else if (name === 'shop') {
      tone(440, 0.1, 0, 'triangle')
      tone(660, 0.16, 0.08, 'triangle')
    } else if (name === 'click') {
      tone(540, 0.06, 0, 'sine', 0.018)
    }
  } catch {
    // Navegadores podem bloquear áudio até a primeira interação.
  }
}
