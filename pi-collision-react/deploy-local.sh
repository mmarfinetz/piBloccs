#!/bin/bash
# Script to build and serve the Pi Block Collision Simulator locally

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "Error: npm is not installed. Please install Node.js and npm first."
  exit 1
fi

echo "Building Pi Block Collision Simulator for production..."

# Use npm ci instead of npm install (more reliable for CI/CD)
echo "Installing dependencies..."
npm ci --legacy-peer-deps || npm install --legacy-peer-deps --force

# Build for production
npm run build

# Check if npx is available (comes with npm)
if command -v npx &> /dev/null; then
  # Serve the production build using npx (no global installation needed)
  echo "Starting production server..."
  npx serve -s build
else
  echo "Error: npx is not available. Please update your Node.js installation."
  exit 1
fi