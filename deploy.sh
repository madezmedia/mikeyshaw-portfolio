#!/bin/bash

# Portfolio Deployment Script

# Color codes for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Deployment Configuration
PROJECT_NAME="Michael Shaw Portfolio"
VERCEL_PROJECT_ID="your-vercel-project-id"
DEPLOY_BRANCH="main"

# Deployment Stages
function pre_deploy_checks() {
    echo -e "${YELLOW}🔍 Running pre-deployment checks...${NC}"
    
    # Check if on correct branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    if [[ "$CURRENT_BRANCH" != "$DEPLOY_BRANCH" ]]; then
        echo -e "${RED}❌ Error: You must be on $DEPLOY_BRANCH branch${NC}"
        exit 1
    fi

    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo -e "${RED}❌ Error: You have uncommitted changes${NC}"
        git status
        exit 1
    fi
}

function install_dependencies() {
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    pnpm install
}

function run_tests() {
    echo -e "${YELLOW}🧪 Running tests...${NC}"
    pnpm test
}

function build_project() {
    echo -e "${YELLOW}🏗️  Building project...${NC}"
    pnpm build
}

function deploy_to_vercel() {
    echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
    vercel --prod
}

function post_deploy_notification() {
    echo -e "${GREEN}✅ Deployment Successful!${NC}"
    echo -e "${YELLOW}🌐 Project: $PROJECT_NAME${NC}"
    echo -e "${YELLOW}📅 Deployed at: $(date)${NC}"
}

# Main Deployment Function
function main() {
    pre_deploy_checks
    install_dependencies
    run_tests
    build_project
    deploy_to_vercel
    post_deploy_notification
}

# Execute Main Deployment
main
