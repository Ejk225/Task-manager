FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG CACHEBUST=1
RUN npm run build

FROM nginx:alpine
# 1. Copie des fichiers de build React
COPY --from=builder /app/dist /usr/share/nginx/html

# 2. Copie du template Nginx (l'image officielle gère le remplacement du $PORT ici)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# 3. On expose le port dynamiquement (optionnel mais propre pour Railway)
EXPOSE 80

# 4. LA CORRECTION ICI : On utilise envsubst pour remplacer $PORT avant de lancer Nginx
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]