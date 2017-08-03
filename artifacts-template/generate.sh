#!/bin/bash

echo
echo
echo "*** Clear existed files"
rm -rf crypto-config
rm genesis.block
rm mychannel.tx
rm docker-compose.yaml
rm -rf ~/.hfc-key-store/
rm -rf /tmp/fabric-client-*
mkdir crypto-config

echo
echo
echo "*** Generate crypto material with cryptogen"
docker-compose -f compose-generate.yaml run --rm cli.example.com bash -c "cryptogen generate --config=cryptogen.yaml --output=crypto-config"
## HERE: output in docker container, not a host machine!


echo
echo
echo "*** Generate orderer genesis block with configtxgen"
docker-compose -f compose-generate.yaml run --rm cli.example.com bash -c "configtxgen -profile TwoOrgsOrdererGenesis -outputBlock ./genesis.block"


echo
echo
echo "*** Generate channel config transaction with configtxgen"
docker-compose -f compose-generate.yaml run --rm cli.example.com bash -c "configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./mychannel.tx -channelID mychannel"


echo
echo
echo "*** Create docker-compose configuration based on predefined template"

ORG1_PK=$(basename `ls crypto-config/peerOrganizations/org1.example.com/ca/*_sk`)
ORG2_PK=$(basename `ls crypto-config/peerOrganizations/org2.example.com/ca/*_sk`)
[[ -z  $ORG1_PK  ]] && echo "empty CA1 private key" && exit 1
[[ -z  $ORG2_PK  ]] && echo "empty CA2 private key" && exit 1

sed -e "s/\$ORG1_PK/$ORG1_PK/g" -e "s/\$ORG2_PK/$ORG2_PK/g"  docker-compose-template.yaml > docker-compose.yaml

echo
echo
echo "*** Done! Use 'docker-compose up' to start network"