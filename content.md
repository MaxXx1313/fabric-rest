# What is fabric-rest?

This server provides a convenient REST interface for web applications to transact on
[Hyperledger Fabric 1.0](https://github.com/hyperledger/fabric) network.
It uses [Node.js SDK](https://github.com/hyperledger/fabric-sdk-node) API to call peers, orderer and CA servers of network's members.

# How to use this image
```bash
docker run \
    -v $PWD/artifacts:/usr/src/artifacts \
    -P \
    maxxx1313/fabric-rest:ibp
```
Api web-interface become available on `http://localhost:4000` when launched.


Image Variants
======================

`maxxx1313/fabric-rest:<version> `
Images for deploying hyperledger blockchain network using legacy configuration file.

`maxxx1313/fabric-rest:<version>-ibp`
Images for working with IBM Blockchain Platform. It's not guaranteed to properly work with legacy configuration, that's the reason why it's located in a separate tag.

Environment
======================
* `PORT` - api/web interface port (default is `4000`)
* `ORG` - (only when usning `network-config.json` format) organization id. No default value, you have to set it explicitly
* `CONFIG_FILE` - ledger config file (default is `../artifacts/network-config.json`).
It can be either `network-config.json` format, or `ibp-config.json` format (preferred).
* `MAX_ATTEMPTS` - (since `0.12.2`) number of attepmpts to reconnect to event hub during start-up (default is `3`). If it was connected at least one time, this limit doesn't matter.
* `INVOKE_TIMEOUT` - (since `0.12.12`) timeout of waiting the block during smart contract invocation

Known issues
======================

* peer ID should be started with 'peer' word (specified in `network-config.json`).

  RIGHT:
```
   ...
        "org1": {
			...
			"peer1": { ... },
			"peer2.example.com": { ... },
			"peer": { ... },
		},
   ...
```

  WRONG:
```
   ...
        "org1": {
			...
			"n1.peer": { ... },
			"host2.example.com": { ... },
		},
   ...
```

* orderer should be named `"orderer"`. No options, you cannot rename it.
