FROM registry.access.redhat.com/ubi8/nodejs-14:1-28.1618434924 AS builder

WORKDIR /opt/app-root/src

COPY . .

RUN ls -lA && npm install
RUN npm run build

FROM registry.access.redhat.com/ubi8/nodejs-14:1-28.1618434924

USER root

## Uncomment the below line to update image security content if any
# RUN dnf -y update-minimal --security --sec-severity=Important --sec-severity=Critical && dnf clean all

COPY ./licenses /licenses

USER default

LABEL name="ibm/template-node-typescript" \
      vendor="IBM" \
      version="1" \
      release="28.1618434924" \
      summary="This is an example of a container image." \
      description="This container image will deploy a Typescript Node App"

COPY --from=builder /opt/app-root/src/dist dist
COPY --from=builder /opt/app-root/src/public public
COPY --from=builder /opt/app-root/src/package*.json ./
RUN npm install --production

ENV HOST=0.0.0.0 PORT=3000

EXPOSE 3000/tcp

CMD ["npm","run","serve"]
