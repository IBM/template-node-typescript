FROM registry.access.redhat.com/ubi8/nodejs-10 AS builder

WORKDIR /opt/app-root/src

COPY src src
COPY swagger.config.json .
COPY tsconfig.json .
COPY package.json .

RUN npm install
RUN npm run build

FROM registry.access.redhat.com/ubi8/nodejs-10

COPY --from=builder /opt/app-root/src/dist dist
COPY public public
COPY package.json .
RUN npm install --production

ENV HOST=0.0.0.0 PORT=3000

EXPOSE 3000/tcp

CMD npm run serve