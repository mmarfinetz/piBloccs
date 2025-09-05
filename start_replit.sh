#!/bin/bash

# Exit on error
set -e

# Print commands being executed
set -x

# Install Python dependencies
echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt

# If React app build directory doesn't exist, build it
if [ ! -d "pi-collision-react/build" ]; then
  echo "Building React app..."
  cd pi-collision-react
  
  # Make sure node dependencies are installed
  npm install --no-fund --no-audit --loglevel=error

  # Build React app
  NODE_OPTIONS="--max_old_space_size=2048" npm run build
  cd ..
fi

# Create static directory for Flask
mkdir -p static

# Copy React build files to static directory
echo "Copying React build files to static directory..."
cp -r pi-collision-react/build/* static/

# Start Flask server
echo "Starting Flask server..."
exec python app.py 