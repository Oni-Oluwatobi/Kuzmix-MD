FROM node:20-slim

WORKDIR /home/container

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install all dependencies including dev (needed for typescript build)
RUN npm install --include=dev

# Copy source
COPY . .

# Build the Next.js pairing portal
RUN npm run build

# Create session directory
RUN mkdir -p bot/session

# Clean up devDependencies after build to save space
RUN npm prune --omit=dev

# Set environment variables
ENV NODE_ENV=production
ENV WS_NO_BUFFER_UTIL=1
ENV PORT=3000

EXPOSE 3000

CMD ["node", "unified.js"]
