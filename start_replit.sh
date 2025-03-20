#!/bin/bash

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# If React app build directory doesn't exist, build it
if [ ! -d "pi-collision-react/build" ]; then
  echo "Building React app..."
  cd pi-collision-react
  
  # Make sure node dependencies are installed
  npm install
  
  # Build React app
  npm run build
  cd ..
fi

# Create static directory for Flask
mkdir -p static

# Copy React build files to static directory
echo "Copying React build files to static directory..."
cp -r pi-collision-react/build/* static/

# Start Flask server
echo "Starting Flask server..."
python app.py 