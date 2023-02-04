# syntax=docker/dockerfile:1
FROM nginx:1.23

COPY src/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY src/web/index.html /usr/share/nginx/html/index.html
