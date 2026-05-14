# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ARG VITE_GOOGLE_ADSENSE_ACCOUNT
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_ADSENSE_ACCOUNT=$VITE_GOOGLE_ADSENSE_ACCOUNT
RUN npm run build

# Stage 2: serve
FROM nginx:stable-alpine
RUN apk add --no-cache openssl
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint-ssl.sh /docker-entrypoint-ssl.sh
RUN chmod +x /docker-entrypoint-ssl.sh
EXPOSE 80 443
ENTRYPOINT ["/docker-entrypoint-ssl.sh"]
CMD ["nginx", "-g", "daemon off;"]
