Changelog
=========

## 0.12.6
* serve ibp-config in `config?v=1` endpoint
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