FROM registry.access.redhat.com/ubi8/nodejs-12:1-70 AS builder

USER root
RUN yum install -y python36 && yum clean all

WORKDIR /opt/app-root/src

USER default

COPY . .

RUN ls -lA && npm install
RUN npm run build

FROM registry.access.redhat.com/ubi8/nodejs-12:1-70

COPY --from=builder /opt/app-root/src/dist dist
COPY --from=builder /opt/app-root/src/public public
COPY --from=builder /opt/app-root/src/package*.json ./
RUN npm install --production

ENV HOST=0.0.0.0 PORT=3000

EXPOSE 3000/tcp

CMD ["npm","run","serve"]
