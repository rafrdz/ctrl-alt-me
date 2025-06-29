MAIN_PACKAGE_PATH := ./cmd/api
BINARY_NAME := api
DATABASE_NAME := ctrl_alt_me.db

.PHONY: run
run:
	go run ${MAIN_PACKAGE_PATH}
