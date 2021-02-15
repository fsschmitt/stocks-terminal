FROM node:12.20-buster-slim

ENV PORT=80

WORKDIR /app

COPY package.json .
RUN npm install

ADD . /app
RUN npm run build

EXPOSE 80
CMD [ "npm", "start" ]
