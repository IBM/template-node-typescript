FROM node:11.12.0-stretch-slim

COPY dist /home/node/dist
COPY public /home/node/public
COPY package.json /home/node

WORKDIR /home/node

RUN npm install --production

ENV HOST=0.0.0.0 PORT=3000

EXPOSE 3000/tcp

CMD npm run serve
