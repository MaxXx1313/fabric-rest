# Dockerfile
FROM node:8-alpine

MAINTAINER maxxx1313

# Create app directory
WORKDIR /usr/src/app

## install dependancies
# COPY ["package.json", "package-lock.json"] .
COPY "package.json" .

RUN apk add --update python make alpine-sdk libc6-compat \
&& npm install && npm cache rm --force \
&& apk del --purge python make alpine-sdk
  # remove node-gyp dependancies (for alpine only)
  # libc6-compat is essential for grps, so don't remove it

# add project files (see .dockerignore for a list of excluded files)
COPY . .

EXPOSE 4000
CMD [ "npm", "start" ]