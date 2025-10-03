MAIN_PACKAGE_PATH := ./cmd/ctrlaltme
BINARY_NAME := ctrlaltme
BIN_DIR := bin

.PHONY: dev-db
dev-db:
	docker compose -f docker-compose.yml up -d

.PHONY: build
build:
	go build -o $(BIN_DIR)/$(BINARY_NAME) $(MAIN_PACKAGE_PATH)
