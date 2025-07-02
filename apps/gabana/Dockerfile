# Use the official Bun image
FROM oven/bun:1.2.12 as base

# Set working directory
WORKDIR /usr/src/app

# Declare build arguments for Firebase configuration
ARG FIREBASE_API_KEY
ARG FIREBASE_AUTH_DOMAIN
ARG FIREBASE_DATABASE_URL
ARG FIREBASE_PROJECT_ID
ARG FIREBASE_STORAGE_BUCKET
ARG FIREBASE_MESSAGING_SENDER_ID
ARG FIREBASE_APP_ID
 

# Copy package.json and bun.lockb (if it exists)
COPY package.json ./
COPY bun.lockb* ./

# Install dependencies
RUN bun install 

# Copy source code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

# Run the application
CMD ["bun", "run", "src/index.ts"]
