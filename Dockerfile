# STAGE 1: Build the React Application
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package files first (for better layer caching)
COPY ["Dashboard web app/project/package.json", "Dashboard web app/project/package-lock.json", "./"]

# Install dependencies
RUN npm ci --only=production=false

# Copy source code (excluding node_modules via .dockerignore)
COPY ["Dashboard web app/project/", "./"]

# Run the build command
RUN npm run build

# Verify build output exists
RUN ls -la dist || (echo "Build failed: dist directory not found" && exit 1)

# STAGE 2: Serve the Static Assets using Nginx
FROM nginx:stable-alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
