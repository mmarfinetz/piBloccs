#!/bin/bash

# Build React app locally first
echo "Building React app locally..."
cd pi-collision-react
npm install --no-fund --no-audit --loglevel=error
npm run build
cd ..

# Deploy the built app
echo "Deploying to Vercel..."
vercel deploy --prod pi-collision-react/build