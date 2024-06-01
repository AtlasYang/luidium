FROM node:20.11-alpine

WORKDIR /app

COPY ./package.json ./

RUN apk add --no-cache git

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]