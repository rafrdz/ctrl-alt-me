MAIN_PACKAGE_PATH := ./cmd/api
BINARY_NAME := ctrl-alt-me-api
LOGS_DIR := logs
DATA_DIR := data

.PHONY: run
run:
	go run ${MAIN_PACKAGE_PATH}

.PHONY: clean
clean:
	rm -rf ${LOGS_DIR} ${BINARY_NAME} ${DATA_DIR}

.PHONY: build
build:
	CGO_ENABLED=1 GOOS=linux go build -o ${BINARY_NAME} ${MAIN_PACKAGE_PATH}
