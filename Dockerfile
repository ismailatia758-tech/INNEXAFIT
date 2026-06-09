FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies (including devDependencies like typescript)
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "run", "start"]
