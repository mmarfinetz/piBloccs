#!/bin/bash

# Exit on error
set -e

# Install Python dependencies for API
echo "Installing API Python dependencies..."
cd api
pip install -r requirements.txt
cd ..

# Build React frontend
echo "Building React frontend..."
cd pi-collision-react
npm install --no-fund --no-audit --loglevel=error
npm run build
cd ..

echo "Build completed successfully" 