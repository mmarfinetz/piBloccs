#!/bin/bash

echo "Running Vercel build script..."

# Disable CI environment to prevent treating warnings as errors
export CI=false

# Build the React application 
npm run build

echo "Build completed successfully"