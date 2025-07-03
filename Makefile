MAIN_PACKAGE_PATH := ./cmd/api
BINARY_NAME := api

.PHONY: run
run:
	go run ${MAIN_PACKAGE_PATH}

.PHONY: clean
clean:
	rm -rf logs *.db
