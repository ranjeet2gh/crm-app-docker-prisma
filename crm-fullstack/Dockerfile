FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate --schema=./src/prisma/schema.prisma


EXPOSE 3000

CMD ["node", "src/server.js"]

