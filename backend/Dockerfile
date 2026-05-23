FROM node:20-alpine

WORKDIR /app

# Copier les dépendances
COPY package*.json ./
RUN npm install --production

# Copier le code source
COPY . .

# Créer le dossier uploads
RUN mkdir -p uploads

EXPOSE 5000

CMD ["node", "server.js"]