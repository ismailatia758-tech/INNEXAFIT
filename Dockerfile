FROM node:20-alpine

# Install nginx and create the required run directory for pid files
RUN apk add --no-cache nginx && mkdir -p /run/nginx

WORKDIR /usr/src/app

# Install root dependencies (Next.js frontend)
COPY package*.json ./
RUN npm install

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy all source files
COPY . .

# Build the Next.js frontend application (optimized for 512MB memory limit)
ENV NEXT_TELEMETRY_DISABLED=1
RUN NEXT_DISABLE_TURBOPACK=1 NODE_OPTIONS="--max-old-space-size=350" npm run build

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8080 (the unified entrypoint for Starlight Hyperlift)
EXPOSE 8080

# Start all three services:
# 1. Express backend on port 4000
# 2. Next.js frontend on port 3000
# 3. Nginx proxy on port 8080 (in the foreground to keep container alive)
CMD ["sh", "-c", "node backend/server.js & npm run start & nginx -g 'daemon off;'"]
