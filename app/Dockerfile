# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build not strictly required for dev mode but good practice
# RUN npm run build

# Expose port (for app)
EXPOSE 3000

# Default command (overridden in docker-compose)
CMD ["npm", "run", "dev"]
