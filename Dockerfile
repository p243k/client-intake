# ---- build stage ----
    FROM node:20-bookworm-slim AS build
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build
    
    # ---- runtime stage ----
    FROM node:20-bookworm-slim
    WORKDIR /app
    
    # Install Chromium + dependencies needed for headless PDF rendering
    RUN apt-get update && apt-get install -y \
      chromium \
      fonts-liberation \
      ca-certificates \
      && rm -rf /var/lib/apt/lists/*
    
    # Tell Puppeteer to use system Chromium
    ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
    ENV NODE_ENV=production
    
    COPY --from=build /app/dist ./dist
    COPY package*.json ./
    
    # Only production deps
    RUN npm ci --omit=dev
    
    # Cloud Run listens on $PORT
    ENV PORT=8080
    EXPOSE 8080
    
    CMD ["node", "dist/client-intake/server/server.mjs"]
    