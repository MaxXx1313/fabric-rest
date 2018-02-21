#!/bin/bash

# verion with dropped PATCH part (https://semver.org/)
VERSION=$(jq -r .version package.json |grep -oP '\d+\.\d+' )
echo "Building maxxx1313/fabric-rest-core:$VERSION"
docker build -t maxxx1313/fabric-rest-core:$VERSION .