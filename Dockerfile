FROM node:18-alpine

WORKDIR /usr/src/app

# Install root dependencies (Next.js frontend)
COPY package*.json ./
RUN npm install

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy all source files
COPY . .

# Build the Next.js frontend application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Expose Next.js port (3000) and Express backend port (4000)
EXPOSE 3000 4000

# Start both services: Backend in background, Frontend in foreground
CMD ["sh", "-c", "node backend/server.js & npm run start"]
