FROM node:slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE $PORT

EXPOSE 3000

CMD ["npm", "start"]
