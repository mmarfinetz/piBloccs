/**
 * Calculate velocities after an elastic collision between two blocks
 * @param {number} m1 - Mass of block 1
 * @param {number} m2 - Mass of block 2
 * @param {number} v1 - Initial velocity of block 1
 * @param {number} v2 - Initial velocity of block 2
 * @returns {Array} - New velocities [v1', v2']
 */
export function calculateCollisionVelocities(m1, m2, v1, v2) {
  const newV1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
  const newV2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
  return [newV1, newV2];
}

/**
 * Calculate time to next collision
 * @param {Array} blocks - Array of block objects with position, velocity, mass, width
 * @param {number} wallPosition - Position of the wall
 * @returns {Object} - Time to collision and type of collision
 */
export function calculateNextCollision(blocks, wallPosition) {
  const [block1, block2] = blocks;
  
  // Time to collision between blocks
  let tBlocks = Infinity;
  // For block collision, we need relative velocity and distance
  const relativeVelocity = block1.velocity - block2.velocity;
  
  // Blocks can collide when m1 is moving faster than m2 toward it (from right to left in our case)
  if (relativeVelocity < 0) {
    // Distance between right edge of m2 and left edge of m1
    const distance = block1.position - (block2.position + block2.width);
    
    if (distance > 0 && Math.abs(relativeVelocity) > 1e-10) {
      tBlocks = distance / Math.abs(relativeVelocity);
    }
  }
  
  // Time to collision with wall
  let tWall = Infinity;
  if (block2.velocity < 0) { // Block 2 moving toward wall (left in our case)
    const distance = block2.position - wallPosition;
    
    if (distance > 0 && Math.abs(block2.velocity) > 1e-10) {
      tWall = distance / Math.abs(block2.velocity);
    }
  }
  
  // Return the earlier collision time and type
  if (tBlocks < tWall && tBlocks !== Infinity) {
    return { time: tBlocks, type: 'blocks' };
  } else if (tWall !== Infinity) {
    return { time: tWall, type: 'wall' };
  }
  
  return { time: Infinity, type: 'none' };
}

/**
 * Calculate the connection to pi for a given collision count and mass ratio
 * @param {number} collisionCount - Number of collisions
 * @param {number} massRatio - Ratio of m1/m2
 * @returns {Object} - Information about pi connection
 */
export function calculatePiConnection(collisionCount, massRatio) {
  if (massRatio === 1) {
    return {
      description: 'Mass ratio 1:1 → 3 collisions',
      piDigits: null,
      power: null
    };
  }
  
  const power = Math.floor(Math.log10(massRatio)) / 2;
  const piDigits = collisionCount / Math.pow(10, power);
  
  return {
    description: `Mass ratio ${massRatio}:1 → ${collisionCount} collisions ≈ π × 10^${power}`,
    piDigits,
    power
  };
}

/**
 * Generate state space coordinates for the circular trajectory diagram
 * @param {number} m1 - Mass of block 1
 * @param {number} m2 - Mass of block 2
 * @param {number} v1 - Velocity of block 1
 * @param {number} v2 - Velocity of block 2
 * @returns {Object} - x and y coordinates for the state space
 */
export function calculateStateSpaceCoordinates(m1, m2, v1, v2) {
  // Calculate momentum components scaled by sqrt(mass)
  const p1 = Math.sqrt(m1) * v1;
  const p2 = Math.sqrt(m2) * v2;
  
  return {
    x: p1,
    y: p2
  };
}

/**
 * Compute the phase angle in the (sqrt(m1)v1, sqrt(m2)v2) plane
 * @param {number} m1
 * @param {number} m2
 * @param {number} v1
 * @param {number} v2
 * @returns {number} angle in radians in [-π, π]
 */
export function calculatePhaseAngle(m1, m2, v1, v2) {
  const p1 = Math.sqrt(m1) * v1;
  const p2 = Math.sqrt(m2) * v2;
  return Math.atan2(p2, p1);
}

/**
 * Galperin wedge angle α for mass ratio m1:m2
 * α = arctan(sqrt(m2/m1))
 * @param {number} m1
 * @param {number} m2
 * @returns {number} alpha in radians
 */
export function calculateGalperinAlpha(m1, m2) {
  if (!m1 || !m2) return NaN;
  return Math.atan(Math.sqrt(m2 / m1));
}

/**
 * Expected total collisions from Galperin's result: floor(π / α)
 * @param {number} m1
 * @param {number} m2
 * @returns {number}
 */
export function expectedCollisionsGalperin(m1, m2) {
  const alpha = calculateGalperinAlpha(m1, m2);
  if (!isFinite(alpha) || alpha <= 0) return null;
  return Math.floor(Math.PI / alpha);
}

/**
 * Format π digits inferred from collisions for 100^n:1-style mass ratios
 * Uses n = round(½ log10(m1/m2)) and returns a string like "3.1415".
 * @param {number} collisions
 * @param {number} m1
 * @param {number} m2
 * @returns {string}
 */
export function formatPiFromCollisions(collisions, m1, m2) {
  if (!collisions || !m1 || !m2) return '';
  const massRatio = m1 / m2;
  // Estimate n digits from ratio ~ 100^n
  const n = Math.max(0, Math.round(0.5 * Math.log10(massRatio)));
  const factor = Math.pow(10, n);
  const approx = collisions / factor;
  // Ensure we always show exactly n decimals (pad with zeros)
  return approx.toFixed(n);
}

/**
 * Generate 3D state space coordinates with additional calculated dimensions
 * @param {number} m1 - Mass of block 1
 * @param {number} m2 - Mass of block 2
 * @param {number} v1 - Velocity of block 1
 * @param {number} v2 - Velocity of block 2
 * @param {number} time - Current simulation time
 * @returns {Object} - x, y, z, and color coordinates for the 3D state space
 */
export function calculate3DStateSpace(m1, m2, v1, v2, time) {
  // Calculate momentum components scaled by sqrt(mass)
  const p1 = Math.sqrt(m1) * v1;
  const p2 = Math.sqrt(m2) * v2;
  
  // Calculate total kinetic energy
  const ke = 0.5 * m1 * v1 * v1 + 0.5 * m2 * v2 * v2;
  
  // Calculate angular momentum (for 2D case, this is perpendicular to the plane)
  const angularMomentum = p1 * p2 * Math.sin(time / 10);
  
  return {
    x: p1,
    y: p2,
    z: ke,
    color: Math.abs(angularMomentum)
  };
}
