FROM node:20-alpine

WORKDIR /app

# Dependências (cache de camada)
COPY package*.json ./
RUN npm install

# Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Código
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
