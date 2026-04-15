# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@8.15.1

WORKDIR /app

# Copy package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/tsconfig/package.json ./packages/config/tsconfig/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY packages/config ./packages/config
COPY turbo.json ./

# Build the application
RUN pnpm run build --filter=api

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.1

# Copy necessary files
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
