#!/bin/bash

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if node_modules exists
if [ ! -d "pi-collision-react/node_modules" ]; then
  echo "Installing Node.js dependencies..."
  cd pi-collision-react
  npm install
  cd ..
fi

# Build React app
echo "Building React app..."
cd pi-collision-react
npm run build
cd ..

# Create a symbolic link for the React build in the Flask static directory
echo "Setting up static files..."
mkdir -p static
ln -sf $(pwd)/pi-collision-react/build/* $(pwd)/static/

# Modify app.py to serve static files
echo "Updating Flask to serve static files..."
if ! grep -q "send_from_directory" app.py; then
  cat <<EOT >> app.py

# Serve static files from React build
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    from flask import send_from_directory
    import os
    if path != "" and os.path.exists(os.path.join('static', path)):
        return send_from_directory('static', path)
    else:
        return send_from_directory('static', 'index.html')
EOT
fi

# Start the Flask server
echo "Starting Flask server..."
python app.py 