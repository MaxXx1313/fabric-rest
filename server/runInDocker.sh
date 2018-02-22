#!/bin/bash

docker run \
--rm \
--network artifactspreset_default \
-p 4000:4000 \
-w /app/server \
-v $PWD/../:/app \
-e ORG=org1 \
-e CONFIG_FILE=/app/artifacts-preset/network-config.json \
 node:6-slim "$@"