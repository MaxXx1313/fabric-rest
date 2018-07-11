# Dockerfile
FROM node:8-alpine

# container with node and fabric-client (needs binary dependancies)

# Create app directory
WORKDIR /usr/src/app

# RUN apk --help
# install node-gyp dependancies (for alpine only)

RUN apk add --update python make alpine-sdk libc6-compat \
&& npm install fabric-client && npm cache rm --force \
&& apk del --purge python make alpine-sdk
   # remove node-gyp dependancies (for alpine only)
   # libc6-compat is essential for grps, so don't remove it

