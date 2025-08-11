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
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json .
ENV NODE_ENV=production
CMD ["node","dist/main.js"]
