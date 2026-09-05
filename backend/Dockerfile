FROM node:20-alpine AS deps
RUN corepack enable pnpm
WORKDIR /app
COPY pnpm-lock.yaml ./capsule/
COPY pnpm-workspace.yaml ./capsule/
COPY package.json ./capsule/
COPY backend/package.json ./capsule/backend/
COPY common/package.json ./capsule/common/
RUN cd capsule && pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY ./backend ./capsule/backend
COPY ./common ./capsule/common

COPY backend/prisma/schema.prisma ./capsule/backend/prisma/schema.prisma
RUN cd capsule/backend && pnpm dlx prisma@6.15.0 generate
RUN cd capsule && pnpm --filter backend build
RUN cd capsule && pnpm --filter common build

FROM node:20-alpine AS builder-prod
RUN corepack enable pnpm
WORKDIR /app

COPY pnpm-lock.yaml ./capsule/
COPY pnpm-workspace.yaml ./capsule/.
COPY package.json ./capsule/.
COPY backend/package.json ./capsule/backend/.
COPY common/package.json ./capsule/common/.
RUN cd capsule && pnpm install --prod --frozen-lockfile
COPY backend/prisma/schema.prisma ./capsule/backend/prisma/schema.prisma
RUN cd capsule/backend && pnpm dlx prisma@6.15.0 generate

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder-prod /app/capsule/node_modules ./capsule/node_modules
COPY --from=builder-prod /app/capsule/backend/node_modules ./capsule/backend/node_modules
COPY --from=builder-prod /app/capsule/common/node_modules ./capsule/common/node_modules
COPY package.json ./capsule/
COPY backend/package.json ./capsule/backend/
COPY common/package.json ./capsule/common/

COPY --from=builder /app/capsule/backend/dist ./capsule/backend/dist
COPY --from=builder /app/capsule/common/dist ./capsule/common/dist
COPY backend/prisma/schema.prisma ./capsule/backend/prisma/schema.prisma

EXPOSE 5555

CMD ["node", "capsule/backend/dist/main"]