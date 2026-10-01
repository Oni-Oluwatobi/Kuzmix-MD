FROM node:20-slim

WORKDIR /home/container

# Single source of truth: install from the root manifest
COPY package.json ./
RUN npm install --ignore-scripts --omit=dev --no-audit --no-fund

# Copy bot source
COPY bot/ ./bot/

# Create session directory
RUN mkdir -p ./bot/session

# Set environment variables for production
ENV NODE_ENV=production
ENV WS_NO_BUFFER_UTIL=1
ENV PORT=3000

# Bot entrypoint (starts via bot/index.js -> bot/main.js)
CMD ["node", "bot/index.js"]
