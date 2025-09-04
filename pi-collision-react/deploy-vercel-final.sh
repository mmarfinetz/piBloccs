#!/bin/bash

echo "Deploying to Vercel..."

# Create a temporary .vercelignore file to prevent unnecessary files from being uploaded
echo "Creating .vercelignore to optimize deployment..."
cat > .vercelignore << EOL
node_modules
.git
README.md
.gitignore
EOL

# Deploy to Vercel with production flag
echo "Running Vercel deployment..."
npx vercel --prod

echo "Deployment process completed!"