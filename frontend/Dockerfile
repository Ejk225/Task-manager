FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build de production
RUN npm run build

# Serveur nginx pour servir le build
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx pour React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]