#!/bin/bash

# Exit on first error
set -e

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Add all files
git add .

# Prompt for commit message
read -p "Enter commit message: " commit_message

# Commit changes
git commit -m "$commit_message"

# Prompt for remote repository URL
read -p "Enter GitHub repository URL: " repo_url

# Add remote if not exists
if ! git remote | grep -q origin; then
    git remote add origin "$repo_url"
fi

# Push to GitHub
git push -u origin main

# Deploy to Vercel
vercel

echo "Deployment completed successfully!"
