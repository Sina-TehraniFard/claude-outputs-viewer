#!/bin/bash

# Claude Outputs Viewer Installation Script
# This script sets up the Claude Outputs Viewer application

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

echo -e "${BLUE}📝 Claude Outputs Viewer Installation${NC}"
echo "=================================================="
echo ""

# Check if Node.js is installed
echo -e "${BLUE}🔍 Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    echo -e "${YELLOW}Please install Node.js v18 or later from: https://nodejs.org${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js found: $NODE_VERSION${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed.${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm found: $NPM_VERSION${NC}"
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Create watch directory
WATCH_DIR="/Users/tehrani/Documents/claude-outputs"
echo -e "${BLUE}📁 Setting up watch directory...${NC}"
if [ ! -d "$WATCH_DIR" ]; then
    mkdir -p "$WATCH_DIR"
    echo -e "${GREEN}✅ Created directory: $WATCH_DIR${NC}"
else
    echo -e "${YELLOW}📁 Directory already exists: $WATCH_DIR${NC}"
fi

# Create a sample file for testing
SAMPLE_DATE=$(date +%Y-%m-%d)
SAMPLE_DIR="$WATCH_DIR/$SAMPLE_DATE"
SAMPLE_FILE="$SAMPLE_DIR/welcome.md"

if [ ! -f "$SAMPLE_FILE" ]; then
    mkdir -p "$SAMPLE_DIR"
    cat > "$SAMPLE_FILE" << 'EOF'
# Welcome to Claude Outputs Viewer

This is a sample document created during installation.

## Features

- 📁 **File Monitoring**: Automatically detects new files in the watch directory
- 🔄 **Real-time Updates**: WebSocket-based live updates
- 📝 **Markdown Preview**: Rich rendering with syntax highlighting
- 🔍 **Search**: Full-text search across all documents
- 🔔 **Notifications**: macOS notifications for new files

## Getting Started

1. The viewer monitors `/Users/tehrani/Documents/claude-outputs/`
2. Files are organized by date in subdirectories
3. Access the web interface at http://localhost:3333
4. Search and browse your Claude-generated documents

Enjoy using Claude Outputs Viewer! 🚀
EOF
    echo -e "${GREEN}✅ Created sample file: $SAMPLE_FILE${NC}"
fi
echo ""

# Make scripts executable
echo -e "${BLUE}🔧 Setting up scripts...${NC}"
chmod +x start.sh
chmod +x install.sh
echo -e "${GREEN}✅ Scripts are now executable${NC}"
echo ""

# Create LaunchAgent plist for auto-start (optional)
PLIST_FILE="$HOME/Library/LaunchAgents/com.claude-outputs-viewer.plist"
echo -e "${BLUE}🤖 Setting up auto-start (optional)...${NC}"

if [ ! -f "$PLIST_FILE" ]; then
    cat > "$PLIST_FILE" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude-outputs-viewer</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$SCRIPT_DIR/start.sh</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$SCRIPT_DIR</string>
    <key>RunAtLoad</key>
    <false/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>/tmp/claude-outputs-viewer.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/claude-outputs-viewer.error.log</string>
</dict>
</plist>
EOF
    echo -e "${GREEN}✅ Created LaunchAgent plist: $PLIST_FILE${NC}"
    echo -e "${YELLOW}💡 To enable auto-start on login, run:${NC}"
    echo -e "${YELLOW}   launchctl load $PLIST_FILE${NC}"
else
    echo -e "${YELLOW}📄 LaunchAgent plist already exists${NC}"
fi
echo ""

# Test installation
echo -e "${BLUE}🧪 Testing installation...${NC}"
if node -e "
const fs = require('fs');
const path = require('path');

// Check if all required files exist
const requiredFiles = [
    'src/server.js',
    'src/watcher.js',
    'src/notifier.js',
    'public/index.html',
    'public/js/app.js',
    'public/css/style.css',
    'package.json'
];

let allExists = true;
for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
        console.log('Missing file:', file);
        allExists = false;
    }
}

if (allExists) {
    console.log('✅ All required files are present');
} else {
    console.log('❌ Some files are missing');
    process.exit(1);
}

// Test require statements
try {
    require('./src/server.js');
    console.log('✅ Server module loads correctly');
} catch (error) {
    console.log('❌ Server module failed to load:', error.message);
    process.exit(1);
}
"; then
    echo -e "${GREEN}✅ Installation test passed${NC}"
else
    echo -e "${RED}❌ Installation test failed${NC}"
    exit 1
fi
echo ""

# Installation complete
echo "=================================================="
echo -e "${GREEN}🎉 Installation completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Run: ${YELLOW}./start.sh${NC} to start the server"
echo -e "2. Open: ${YELLOW}http://localhost:3333${NC} in your browser"
echo -e "3. Check the sample file in the web interface"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo -e "• Start server: ${YELLOW}./start.sh${NC}"
echo -e "• Start with npm: ${YELLOW}npm start${NC}"
echo -e "• Development mode: ${YELLOW}npm run dev${NC}"
echo ""
echo -e "${BLUE}Watch directory: ${YELLOW}$WATCH_DIR${NC}"
echo ""
echo -e "${GREEN}Happy document viewing! 📚${NC}"