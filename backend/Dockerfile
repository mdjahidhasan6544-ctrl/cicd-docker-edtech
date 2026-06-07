# =====================================================
# Stage 1: Builder
# Installs ALL dependencies (dev + prod) and prepares
# the application source. The compiled output is plain
# JavaScript (ESM), so no `npm run build` is needed —
# this stage primarily isolates dependency installation
# from the runtime image.
# =====================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first to maximize layer caching
COPY package*.json ./

# Install all dependencies (dev + prod) for the build stage
RUN npm ci

# Copy the rest of the source code
COPY . .

# =====================================================
# Stage 2: Production runtime
# Minimal image with only production dependencies,
# running as a non-root user.
# =====================================================
FROM node:22-alpine

WORKDIR /app

# Mark as production runtime
ENV NODE_ENV=production

# Install curl for the HEALTHCHECK (Alpine ships without it)
# wget is included in nginx:alpine but not in node:alpine
RUN apk add --no-cache curl

# Copy package files from the builder stage
COPY package*.json ./

# Install ONLY production dependencies and clean the npm cache
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source from the builder stage
COPY --from=builder /app/src ./src
COPY --from=builder /app/api ./api
COPY --from=builder /app/server.js ./server.js

# Create and switch to a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app
USER nodejs

# Expose the API port (matches docker-compose mapping)
EXPOSE 5000

# Healthcheck: /api/health is registered before the rate limiter in app.js,
# so it is never throttled and always returns 200 when the process is up.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://localhost:5000/api/health || exit 1

# Start the Node.js server
CMD ["node", "src/index.js"]
