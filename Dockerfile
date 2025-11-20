# Multi-stage build for production
# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Accept build arguments for Vite environment variables
ARG VITE_DATAVERSE_BASE_URL
ARG VITE_API_BASE_URL
ARG VITE_USE_BACKEND=true

# Set them as environment variables for the build
ENV VITE_DATAVERSE_BASE_URL=$VITE_DATAVERSE_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_USE_BACKEND=$VITE_USE_BACKEND

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Setup backend and serve
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy backend server
COPY server ./server

# Copy built frontend from previous stage
COPY --from=frontend-build /app/dist ./public

# Copy nginx config (for reference, but we'll serve with Node)
COPY src/nginx.conf ./nginx.conf

# Expose backend port
EXPOSE 3001

# Start the backend server
CMD ["node", "server/index.js"]