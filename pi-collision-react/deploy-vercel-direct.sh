#!/bin/bash

# Exit on error
set -e

echo "Preparing for direct Vercel deployment..."

# Deploy directly to Vercel without npm operations
echo "Deploying to Vercel..."
npx vercel --prod

echo "Deployment completed"