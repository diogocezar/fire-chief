#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the script directory
cd "$SCRIPT_DIR"

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

# Log the Node.js version being used
echo "Using Node.js version: $(node -v)"

# Run the Fire Chief script with experimental fetch option
echo "Starting Fire Chief at $(date)"
NODE_OPTIONS="--experimental-fetch" node index.js
echo "Fire Chief completed at $(date)" 