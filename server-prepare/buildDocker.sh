#!/bin/bash
cp ../server/package.json ./

VERSION=$(jq -r .version package.json)
TAG="maxxx1313/fabric-rest:$VERSION-core"
echo "Building $TAG"
docker build -t $TAG --label com.altoros.version="$VERSION" .

rm package.json