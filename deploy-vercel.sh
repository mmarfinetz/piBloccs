#!/bin/bash

# Exit on error
set -e

echo "Preparing for Vercel deployment..."

# Skip permissions step as we can't change some files
echo "Skipping permissions step..."

# Make sure API directory exists and has simulation.py
echo "Setting up API directory..."
mkdir -p api
if [ ! -f "api/simulation.py" ]; then
  echo "Copying simulation module to API directory..."
  cp simulation.py api/
fi

# Deploy directly to Vercel (will use vercel-build command from package.json)
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment completed!" 