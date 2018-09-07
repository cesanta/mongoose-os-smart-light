FROM alpine:3.6
RUN apk add --update nodejs nodejs-npm && rm -rf /var/cache/apk/*
ADD main.js package.json /
RUN npm install
VOLUME /data
VOLUME /api-server
