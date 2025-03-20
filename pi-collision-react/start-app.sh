#!/bin/bash
# Script to quickly set up and run the Pi Block Collision Simulator

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "Error: npm is not installed. Please install Node.js and npm first."
  exit 1
fi

echo "Setting up Pi Block Collision Simulator..."

# Install dependencies
npm install

# Start the development server
echo "Starting the development server..."
npm start

# The server should be running at http://localhost:3000