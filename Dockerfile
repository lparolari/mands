FROM node:12.18.4

WORKDIR /app

COPY ./package.json .

RUN yarn
