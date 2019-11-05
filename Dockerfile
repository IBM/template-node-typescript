FROM registry.access.redhat.com/ubi8/nodejs-10

WORKDIR ${HOME}

COPY src .
COPY swagger.config.json .
COPY package.json .

RUN npm install
RUN npm run build

ENV HOST=0.0.0.0 PORT=3000

EXPOSE 3000/tcp

CMD npm run serve
