# =====================================================
# Stage 1: Build the React (Vite) application
# =====================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies needed to build the app
RUN npm ci

# Allow the API URL to be injected at build time.
# Default: empty string → axiosInstance uses relative paths,
# which works with same-origin nginx reverse-proxy to the backend service.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

# Copy the rest of the source code
COPY . .

# Build the production bundle to /app/dist
RUN npm run build

# =====================================================
# Stage 2: Serve the built static assets with Nginx
# =====================================================
FROM nginx:1.27-alpine

# Remove the default Nginx site
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom config (SPA fallback + /api reverse proxy to backend)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Healthcheck: confirm Nginx is serving the SPA shell
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start Nginx in the foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]
