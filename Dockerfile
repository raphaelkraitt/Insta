# Use Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy root files
COPY package*.json ./

# Copy workspace packages
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# Install dependencies (will install for all workspaces, which is fine)
RUN npm install

# Build shared package first
WORKDIR /app/packages/shared
RUN npm run build

# Build server
WORKDIR /app/apps/server
RUN npm run build
RUN cp src/db/schema.sql dist/db/schema.sql

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
