FROM node:20-alpine AS proto-gen
RUN corepack enable pnpm

ENV CI=true

RUN apk add --no-cache openssh-client protobuf git
RUN mkdir -p -m 0700 ~/.ssh && ssh-keyscan gitlab.com >> ~/.ssh/known_hosts
WORKDIR /app
RUN --mount=type=ssh \
    git clone git@gitlab.com:capsule-tech/platform/contracts.git /app/contracts

FROM proto-gen AS deps
WORKDIR /app
COPY pnpm-lock.yaml ./capsule/
COPY pnpm-workspace.yaml ./capsule/
COPY package.json ./capsule/

COPY backend/package.json ./capsule/backend/
COPY common/package.json ./capsule/common/

RUN cd capsule && pnpm install --frozen-lockfile

FROM deps AS builder
WORKDIR /app

COPY . ./capsule/
COPY --from=proto-gen ./app/contracts ./

RUN cd capsule && pnpm --filter backend build
RUN cd capsule && pnpm --filter common build
RUN cd capsule/backend && pnpm proto:generate

FROM builder AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY pnpm-lock.yaml ./capsule/
COPY pnpm-workspace.yaml ./capsule/.
COPY package.json ./capsule/.
COPY backend/package.json ./capsule/backend/.
COPY common/package.json ./capsule/common/.

RUN cd capsule && pnpm install --prod --frozen-lockfile

COPY --from=builder /app/capsule/backend/dist ./capsule/backend/dist
COPY --from=builder /app/capsule/common/dist ./capsule/common/dist
COPY --from=builder /app/capsule/backend/generated ./capsule/backend/generated
COPY backend/prisma/schema.prisma ./capsule/backend/prisma/schema.prisma
COPY backend/generated ./capsule/backend/generated
RUN cd capsule/backend && pnpm dlx prisma@6.15.0 generate

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

EXPOSE 5555

CMD ["node", "capsule/backend/dist/src/main"]