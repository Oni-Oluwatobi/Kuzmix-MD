FROM node:20-slim

WORKDIR /home/container

# Copy package files first for better layer caching
COPY bot/package.json ./bot/

# Install bot dependencies (ignore scripts to avoid Baileys preinstall issues on some platforms)
WORKDIR /home/container/bot
RUN npm install --ignore-scripts

# Copy bot source
WORKDIR /home/container
COPY bot/ ./bot/

# Create session directory
RUN mkdir -p /home/container/bot/session

# Set environment variables for production
ENV NODE_ENV=production
ENV WS_NO_BUFFER_UTIL=1
ENV PORT=3000

# Expose no ports (bot connects outbound to WhatsApp)
# If using the web pairing portal, expose 3000
# EXPOSE 3000

CMD ["node", "index.js"]
