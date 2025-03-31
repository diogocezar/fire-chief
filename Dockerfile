FROM node:20-alpine

# Install crond and bash
RUN apk add --no-cache bash tzdata

# Set timezone
ENV TZ=America/Sao_Paulo

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Copy the Docker-specific script and make it executable
COPY run-fire-chief-docker.sh /app/run-fire-chief.sh
RUN chmod +x /app/run-fire-chief.sh

# Add crontab file
RUN echo "0 9 * * 1 /app/run-fire-chief.sh >> /app/fire-chief.out 2>> /app/fire-chief.err" > /etc/crontabs/root

# Create a wrapper script to start cron daemon - with explicit write to file
RUN echo '#!/bin/bash' > /app/start.sh
RUN echo 'echo "Fire Chief container started. Will run every Monday at 9:00 AM."' >> /app/start.sh
RUN echo 'echo "Container started at $(date)"' >> /app/start.sh
RUN echo 'crond -f -l 8' >> /app/start.sh
RUN chmod +x /app/start.sh

# Verify the script exists and is executable
RUN ls -la /app/start.sh && cat /app/start.sh

# Start cron daemon in foreground
CMD ["/app/start.sh"] 