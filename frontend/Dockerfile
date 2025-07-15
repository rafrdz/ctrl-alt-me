FROM node:22-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build

EXPOSE 8080

CMD [ "npm", "run", "preview" ]
