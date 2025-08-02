#!/bin/bash

# Claude Outputs Viewer Start Script
# This script starts the Claude Outputs Viewer server

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}🚀 Starting Claude Outputs Viewer...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18 or later.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if ! node -e "process.exit(require('semver').gte('$NODE_VERSION', '$REQUIRED_VERSION') ? 0 : 1)" 2>/dev/null; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is not supported. Please install Node.js v18 or later.${NC}"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Dependencies not found. Installing...${NC}"
    npm install
fi

# Create watch directory if it doesn't exist
WATCH_DIR="/Users/tehrani/Documents/claude-outputs"
if [ ! -d "$WATCH_DIR" ]; then
    echo -e "${YELLOW}📁 Creating watch directory: $WATCH_DIR${NC}"
    mkdir -p "$WATCH_DIR"
fi

# Check if server is already running
PID_FILE="$SCRIPT_DIR/.server.pid"
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Server is already running (PID: $PID)${NC}"
        echo -e "${BLUE}🌐 Open http://localhost:3333 in your browser${NC}"
        exit 0
    else
        # Remove stale PID file
        rm "$PID_FILE"
    fi
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping server...${NC}"
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            kill "$PID"
            echo -e "${GREEN}✅ Server stopped${NC}"
        fi
        rm -f "$PID_FILE"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start the server
echo -e "${GREEN}✅ Starting server...${NC}"
echo -e "${BLUE}📁 Watching: $WATCH_DIR${NC}"
echo -e "${BLUE}🌐 Web interface: http://localhost:3333${NC}"
echo -e "${YELLOW}📋 Press Ctrl+C to stop${NC}"
echo ""

# Start server and save PID
node src/server.js &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"

# Wait for server to start
sleep 2

# Check if server is running
if ps -p "$SERVER_PID" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server started successfully (PID: $SERVER_PID)${NC}"
    
    # Try to open browser (macOS only)
    if command -v open &> /dev/null; then
        echo -e "${BLUE}🌐 Opening browser...${NC}"
        sleep 1
        open "http://localhost:3333" 2>/dev/null || true
    fi
    
    # Wait for the server process
    wait "$SERVER_PID"
else
    echo -e "${RED}❌ Failed to start server${NC}"
    rm -f "$PID_FILE"
    exit 1
fi