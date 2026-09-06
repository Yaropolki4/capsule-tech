FROM node:20-alpine AS base


FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY landing/package.json ./landing/
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY common/package.json ./common/
RUN corepack enable pnpm && pnpm i --frozen-lockfile


FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_FRONTEND_URL
COPY landing ./landing
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/landing/node_modules ./landing/node_modules
RUN corepack enable pnpm && pnpm --filter landing build


FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/landing/.next/standalone ./
COPY --from=builder /app/landing/public ./landing/public
COPY --from=builder --chown=nextjs:nodejs /app/landing/.next/static ./landing/.next/static
USER nextjs
EXPOSE 4100

CMD ["node", "landing/server.js"]
