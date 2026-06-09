FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy all source files
COPY . .

# Expose backend port
EXPOSE 4000

# Start server
CMD ["npm", "start"]
