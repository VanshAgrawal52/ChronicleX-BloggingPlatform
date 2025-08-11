FROM node:20-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm i -g pnpm@9.6.0

FROM base AS deps
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY package.json next.config.js* ./
EXPOSE 3000
CMD ["pnpm","start"]
