#!/bin/bash

# Exit on error
set -e

echo "Preparing for Vercel deployment..."

# Install dependencies including the new plotly dependencies
echo "Installing dependencies..."
npm ci --legacy-peer-deps || npm install --legacy-peer-deps --force

# Build the project
echo "Building project..."
npm run build

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npx vercel@latest
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
npx vercel --prod

echo "Deployment completed successfully!"