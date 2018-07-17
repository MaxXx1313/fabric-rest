#!/bin/bash


which jq 2>/dev/null
retcode=$?
#echo $retcode

set -e
if [ $retcode -eq 0 ]; then
  VERSION=$(jq -r .version package.json);
else
  echo "WARN: no 'jq' found. Fallback to unstable variant"
  echo "Please, install 'jq' because it's more reliable for getting json data"
  VERSION=$(cat package.json |grep '"version"'|cut -d':' -f2- | grep -oP '".*"'|sed s/\"//g);
fi;

TAG="maxxx1313/fabric-rest:$VERSION-ibp"
echo "Building $TAG"

docker build -t "$TAG" --label version="$VERSION" .

docker tag "$TAG" "ibp"

echo "Done!"
echo
echo "Push images:"
echo "  docker push $TAG"
echo "  docker push ibp"


