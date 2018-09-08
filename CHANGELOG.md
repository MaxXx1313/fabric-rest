Changelog
=========
## 0.12.12
* use channel event hub to perform invoke transaction

## 0.12.11
* use channel event hub to perform invoke transaction
* added grpc options to peers and orderer
* set grpc opts tighter per IBM recommendation

## 0.12.7 - 0.12.10
* set grpc opts tighter per IBM recommendation

## 0.12.6
* serve ibp-config (sensitive information are cut off) in `/config?v=1` endpoint
* fix #4: network-config isn't work due to `enrollId`
* remove `X_*` env from config


## 0.12.5
* pass evironment variables which starts with `WEBAPP_*` to config

## 0.12.4
* use `x-organizationName` from `ibp-config.json`
* pass evironment variables which starts with `WEBAPP_*` to UI `__env` varialble
* add block history view

## 0.12.3
* fix: first start
* private keys are moved to `artifacts` directory
* config format detected automatically (`network-config`, `ipc-config`)

## earlier
* add `ibp-config` support
* fix mutliorder configuration
* make several (`3`) attempts to connect to event hub