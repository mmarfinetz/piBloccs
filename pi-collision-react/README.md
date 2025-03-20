# Pi Block Collision Simulator

A React-based interactive visualization of the famous "pi block collision" experiment, where two colliding blocks can compute digits of pi when the mass ratio is a power of 100.

## Features

- Interactive simulation with smooth animations
- Real-time collision counter
- Adjustable mass ratios (1:1, 100:1, 10000:1, 1000000:1 or custom)
- Adjustable simulation speed
- Data visualization including position plots and state space trajectory
- Educational explanations about the physics and math behind the phenomenon
- Light/dark mode support
- Optional sound effects for collisions

## How to Run

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## The Pi Connection

When a large block collides with a smaller block near a wall, with mass ratios that are powers of 100, the total number of collisions approximates π × 10^n:

- Mass ratio 1:1 → 3 collisions
- Mass ratio 100:1 → 31 collisions ≈ π × 10
- Mass ratio 10000:1 → 314 collisions ≈ π × 100
- Mass ratio 1000000:1 → 3141 collisions ≈ π × 1000

This fascinating connection between physics and mathematics emerges from the conservation laws of momentum and energy, creating a circular trajectory in state space that's directly related to π.
