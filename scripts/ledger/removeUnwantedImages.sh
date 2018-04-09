#!/usr/bin/env bash


# Delete any images that were generated as a part of this setup
# specifically the following images are often left behind:
# TODO list generated image naming patterns

SEARCH="dev\|none\|test-vp\|peer[0-9]-"
DOCKER_IMAGE_IDS=$(docker images | grep ${SEARCH} | awk '{print $3}')
if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" == " " ]; then
  echo "No docker images available for deletion with  $SEARCH"
else
  echo "Removing docker images found with $SEARCH: $DOCKER_IMAGE_IDS"
  docker rmi -f ${DOCKER_IMAGE_IDS}
fi