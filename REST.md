# Sample REST calls

## Enroll user

```bash
JWT=`curl 'http://localhost:4000/users' -H 'Content-Type: application/json' -d '{"username":"admin"}' | jq -r .token`

echo $JWT
```
save returned token into env variable JWT to authenticate in subsequent requests

## List channels the peer joined
```bash
curl 'http://localhost:4000/channels?peer=peer1' -H "Authorization: Bearer $JWT"
```

## List chaincodes instantiated on a channel
```bash
curl 'http://localhost:4000/chaincodes?channel=mychannel&peer=peer1&type=ready' -H "Authorization: Bearer $JWT"
```

## Invoke chaincode (ex. `mycc`)
```bash
TX=`curl 'http://localhost:4000/channels/mychannel/chaincodes/mycc' -H "Authorization: Bearer $JWT"  -H 'Content-Type: application/json' -d '{"peers":["org1/peer0","org2/peer0"],"fcn":"move","args":["a","b","10"]}' | jq -r .transaction`

echo $TX
```
save returned token into env variable TX to use subsequent queries

## Query for transaction details
```bash
curl "http://localhost:4000/channels/mychannel/transactions/$TX?peer=peer1" -H "Authorization: Bearer $JWT"
```
## Query chaincode
```bash
curl 'http://localhost:4000/channels/mychannel/chaincodes/mycc?args=%5B%22a%22%5D&fcn=query&peer=org1%2Fpeer0' -H "Authorization: Bearer $JWT"
```
## Query channel for basic block info
```bash
HASH=`curl 'http://localhost:4000/channels/mychannel?peer=peer1' -H "Authorization: Bearer $JWT" | jq -r .currentBlockHash`

echo $HASH 
```
save returned currentBlockHash into env variable HASH to use subsequent queries

## Query for block info
```bash
curl "http://localhost:4000/channels/mychannel/blocks?hash=$HASH&peer=peer1" -H "Authorization: Bearer $JWT"
```

# Utility Calls

## Network configuration
```bash
curl -i http://localhost:4000/config
```

## Genesis block
```bash
curl -i http://localhost:4000/genesis
```
## Create channel

_Work In Progress_

```bash
curl -iXPOST http://localhost:4000/channels -d '{...}'
```

## Join channel

_Work In Progress_

```bash
curl -iXPOST http://localhost:4000/channels/:channelName/peers -d '{...}'
```

## Channel binary config

_Work In Progress_

```bash
curl -i http://localhost:4000/channels/<channelName>/config
```