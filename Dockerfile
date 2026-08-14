# --- Build stage ----------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
# libc6-compat permite o sharp usar seus binários pré-compilados (linuxmusl) no Alpine
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runtime stage --------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATA_DIR=/app/data

# libc6-compat: sharp (vips embutido). ffmpeg: compressão de vídeo no UPLOAD
# (roda só quando o admin sobe/otimiza mídia — nunca no boot nem em requests).
RUN apk add --no-cache libc6-compat ffmpeg

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Diretório de dados persistentes — monte um volume aqui no EasyPanel!
RUN mkdir -p /app/data /app/data/uploads \
 && chown -R nextjs:nodejs /app/data
VOLUME ["/app/data"]

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
