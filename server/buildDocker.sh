#!/bin/bash

VERSION=$(jq -r .version package.json)
TAG="maxxx1313/fabric-rest:$VERSION"
echo "Building $TAG"
docker build -t $TAG --label com.altoros.version="$VERSION" .

