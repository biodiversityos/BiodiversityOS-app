# ── builder ────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# NEXT_PUBLIC_ vars are embedded into the JS bundle at build time
ARG NEXT_PUBLIC_INDEXER_URL
ARG NEXT_PUBLIC_CONTRACT_ADDRESS
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_CHAIN
ARG NEXT_PUBLIC_TESTNET_RPC_URL

ENV NEXT_PUBLIC_INDEXER_URL=$NEXT_PUBLIC_INDEXER_URL
ENV NEXT_PUBLIC_CONTRACT_ADDRESS=$NEXT_PUBLIC_CONTRACT_ADDRESS
ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_CHAIN=$NEXT_PUBLIC_CHAIN
ENV NEXT_PUBLIC_TESTNET_RPC_URL=$NEXT_PUBLIC_TESTNET_RPC_URL

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ── runner ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]
