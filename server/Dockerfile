# Build stage: bun installs deps and compiles NestJS
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN bun run build

# Runtime stage: node for a stable long-running process
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
