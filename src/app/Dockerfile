# syntax=docker/dockerfile:1
FROM node:18.13

ARG TUNNEL_GID=1655

RUN groupadd --gid ${TUNNEL_GID} tunnel \
	&& usermod --append --groups tunnel node

USER node

WORKDIR /home/node/app

COPY --chown=node:node package*.json .
RUN NODE_ENV=production npm install --omit=dev --omit=optional \
	&& npm cache clean --force

COPY --chown=node:node dist .

EXPOSE 8008

CMD ["node", "--enable-source-maps", "server.js"]
