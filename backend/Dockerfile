# Stage 1: Build stage (we use multi-stage to make image smaller)
FROM node:18-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Stage 2: Runtime stage
FROM node:18-alpine

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port 5000 (where our app runs)
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]