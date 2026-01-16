#!/bin/bash

# Build the application
echo "Building application..."
npm run build

# Create .nojekyll file to disable Jekyll processing
touch dist/.nojekyll

# Remove old files (except node_modules, src, dist, and git files)
echo "Cleaning up old files..."
find . -maxdepth 1 -type f ! -name 'package*.json' ! -name 'vite.config.js' ! -name 'deploy.sh' ! -name '.gitignore' -delete
rm -rf assets 2>/dev/null

# Copy built files to root
echo "Copying built files..."
cp dist/index.html ./index.html
cp -r dist/assets ./assets
cp dist/.nojekyll ./.nojekyll

# Remove index.md and _config.yml if they exist
rm -f index.md _config.yml

echo "Deployment files ready!"
echo "Run 'git add .' and 'git commit' to commit the changes"
