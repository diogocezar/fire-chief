#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the script directory
cd "$SCRIPT_DIR"

# Load nvm if available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Load environment variables if .env exists, ignoring comments
if [ -f .env ]; then
    while IFS= read -r line || [[ -n "$line" ]]; do
        # Skip comments and empty lines
        if [[ $line =~ ^[[:space:]]*$ ]] || [[ $line =~ ^[[:space:]]*# ]]; then
            continue
        fi
        export "$line"
    done < .env
fi

# Ensure we can find Node.js
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

# Try to use nvm to set Node.js version
if command -v nvm &> /dev/null; then
    nvm use 20 || nvm use node
fi

# Check if node exists
if ! command -v node &> /dev/null; then
    echo "Error: Node.js not found. Please ensure Node.js is installed."
    exit 1
fi

# Log the Node.js version being used
echo "Using Node.js version: $(node -v)"

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run the Fire Chief script
NODE_OPTIONS="--experimental-fetch" node index.js 