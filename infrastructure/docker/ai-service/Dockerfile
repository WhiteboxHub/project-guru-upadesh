# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8.15.1

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/ai-service/package.json ./apps/ai-service/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/tsconfig/package.json ./packages/config/tsconfig/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/ai-service ./apps/ai-service
COPY packages/shared ./packages/shared
COPY packages/config ./packages/config
COPY turbo.json ./

# Build the application
RUN pnpm run build --filter=ai-service

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.1

# Copy necessary files
COPY --from=builder /app/apps/ai-service/dist ./dist
COPY --from=builder /app/apps/ai-service/node_modules ./node_modules
COPY --from=builder /app/apps/ai-service/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

# Start the application
CMD ["node", "dist/main.js"]
