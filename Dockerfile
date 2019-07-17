FROM registry.access.redhat.com/ubi8/nodejs-10

COPY dist ${HOME}/dist
COPY public ${HOME}/public
COPY package.json ${HOME}

WORKDIR ${HOME}

RUN npm install --production

ENV HOST=0.0.0.0 PORT=3000

EXPOSE 3000/tcp

CMD npm run serve
