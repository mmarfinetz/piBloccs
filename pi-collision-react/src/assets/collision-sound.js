// Utility functions for generating collision sounds
// Used by the useCollisionSound hook

/**
 * Create a sound buffer for block collisions
 * @param {AudioContext} audioContext - The audio context to use
 * @param {number} duration - Duration of the sound in seconds
 * @param {number} frequency - Frequency of the sound in Hz
 * @returns {AudioBuffer} The generated sound buffer
 */
export function createCollisionSound(audioContext, duration = 0.15, frequency = 440) {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = duration * sampleRate;
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate a simple sine wave with decay
  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-10 * t); // Exponential decay
    data[i] = Math.sin(2 * Math.PI * frequency * t) * decay;
  }

  return buffer;
}

/**
 * Create a sound buffer for wall collisions
 * @param {AudioContext} audioContext - The audio context to use
 * @param {number} duration - Duration of the sound in seconds
 * @param {number} frequency - Frequency of the sound in Hz
 * @returns {AudioBuffer} The generated sound buffer
 */
export function createWallCollisionSound(audioContext, duration = 0.15, frequency = 330) {
  const sampleRate = audioContext.sampleRate;
  const bufferSize = duration * sampleRate;
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  // Generate a triangle wave with sharper decay for wall sound
  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;
    const period = 1 / frequency;
    const cycle = (t % period) / period;
    const waveform = cycle < 0.5 ? 4 * cycle - 1 : 3 - 4 * cycle; // Triangle wave
    const decay = Math.exp(-15 * t); // Faster decay for wall
    
    data[i] = waveform * decay;
  }

  return buffer;
}