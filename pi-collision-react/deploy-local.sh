#!/bin/bash
# Script to build and serve the Pi Block Collision Simulator locally

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "Error: npm is not installed. Please install Node.js and npm first."
  exit 1
fi

echo "Building Pi Block Collision Simulator for production..."

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build for production
npm run build

# Install serve if not already installed
if ! command -v serve &> /dev/null; then
  echo "Installing serve package..."
  npm install -g serve
fi

# Serve the production build
echo "Starting production server..."
serve -s build