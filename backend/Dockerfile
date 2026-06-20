FROM node:20-alpine

WORKDIR /app

# Dependências (cache de camada). Copia o schema antes do install porque o
# postinstall roda `prisma generate` e precisa dele.
COPY package*.json ./
COPY prisma ./prisma
RUN npm install

# Código e build de produção
COPY . .
RUN npm run build

EXPOSE 3001

# `npm start` aplica as migrations e sobe o servidor compilado
CMD ["npm", "start"]
