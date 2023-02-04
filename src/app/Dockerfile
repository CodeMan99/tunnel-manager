# syntax=docker/dockerfile:1
FROM node:18.13

USER node

WORKDIR /home/node/app

COPY package*.json .
RUN NODE_ENV=production npm install --omit=dev --omit=optional \
	&& npm cache clean --force

COPY dist .

EXPOSE 8008

CMD ["node", "--enable-source-maps", "server.js"]
