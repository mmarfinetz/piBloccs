/**
 * Utility functions for exporting simulation data
 */

/**
 * Create a GIF from the simulation canvas
 * @param {HTMLCanvasElement} canvas - The canvas element to capture
 * @param {number} duration - Duration of the GIF in milliseconds
 * @param {number} fps - Frames per second
 * @returns {Promise<Blob>} The GIF as a Blob
 */
export async function createGIF(canvasRef, duration = 3000, fps = 30) {
  // This is a placeholder for actual GIF creation
  // In a real implementation, you would use a library like gif.js
  
  // For demonstration purposes, we'll just create a data URL from the canvas
  return new Promise((resolve) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      resolve(null);
      return;
    }
    
    // Just capture the current state as PNG (in a real app, would create a GIF)
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/png');
  });
}

/**
 * Export simulation data as JSON
 * @param {Object} simState - The current simulation state
 * @returns {Blob} The JSON data as a Blob
 */
export function exportSimulationData(simState) {
  const exportData = {
    massRatio: simState.blocks[0].mass / simState.blocks[1].mass,
    collisionCount: simState.collisionCount,
    piApproximation: simState.collisionCount / Math.pow(10, Math.floor(Math.log10(simState.blocks[0].mass) / 2)),
    collisionEvents: simState.collisionEvents,
    positionHistory: simState.positionHistory
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Download a blob as a file
 * @param {Blob} blob - The blob to download
 * @param {string} filename - The filename to use
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}