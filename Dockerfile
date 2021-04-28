FROM registry.access.redhat.com/ubi8/nodejs-14:1-28 AS builder

## Requirement 1: Universal base image (UBI)
## Requirement 4: Non-root, arbitrary user IDs is already taken care
## Requirement 5: Two-stage image builds is already taken care

## Requirement 2: Updated image security content

USER root

## comment the below line if there are no sec severities
RUN dnf -y update-minimal --security --sec-severity=Important --sec-severity=Critical && dnf clean all

## Requirement 7: Image License

COPY ./licenses /licenses

WORKDIR /opt/app-root/src

USER default

COPY . .

RUN ls -lA && npm install
RUN npm run build

FROM registry.access.redhat.com/ubi8/nodejs-14:1-28

## Requirement 3: Do not modify, replace or combine Red Hat packages or layers is already taken care

## Requirement 6: Image Identification
LABEL name="Typescript Microservice" \
      vendor="IBM" \
      version="v1.0.0" \
      release="1" \
      summary="This is an example of a container image." \
      description="This container image will deploy a Typescript Node App"

COPY --from=builder /opt/app-root/src/dist dist
COPY --from=builder /opt/app-root/src/public public
COPY --from=builder /opt/app-root/src/package*.json ./
RUN npm install --production

ENV HOST=0.0.0.0 PORT=3000

EXPOSE 3000/tcp

CMD ["npm","run","serve"]
