# ── builder ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_ vars are embedded at build time — must be passed as build args
ARG NEXT_PUBLIC_INDEXER_URL
ENV NEXT_PUBLIC_INDEXER_URL=$NEXT_PUBLIC_INDEXER_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── runner ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]
