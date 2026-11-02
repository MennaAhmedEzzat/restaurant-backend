FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install --only=production

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]