# Streambert — static web build served behind nginx.
# Multi-arch base images (node:alpine, nginx:alpine) run natively on
# Raspberry Pi (arm64/armv7), no emulation needed.

FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
