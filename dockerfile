# Use lightweight Node.js 18 image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup --system nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown nextjs:nodejs /app

# Install system-level dependencies (required for some native modules)
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production=false

# Copy the rest of the app
COPY . .

# Generate Prisma Client (requires DATABASE_URL to be set at build time or in .env)
# If you don't have access to DATABASE_URL at build time, see note below ⚠️
RUN npx prisma generate

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Start the server
CMD ["npm", "start"]