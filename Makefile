MAIN_PACKAGE_PATH := ./cmd/api
BINARY_NAME := ctrl-alt-me-api
BIN_DIR := bin
LOGS_DIR := logs
DATA_DIR := data
FRONTEND_DIR := frontend

.PHONY: build
build: build-frontend
	go build -o ${BIN_DIR}/${BINARY_NAME} ${MAIN_PACKAGE_PATH}

.PHONY: build-frontend
build-frontend:
	cd ${FRONTEND_DIR} && npm install && npm run build

.PHONY: build-production
build-production: build-frontend
	go build -o ${BIN_DIR}/${BINARY_NAME} ${MAIN_PACKAGE_PATH}

.PHONY: run-backend
run-backend:
	go run ${MAIN_PACKAGE_PATH}

.PHONY: run-dev
run-dev:
	cd ${FRONTEND_DIR} && npm run dev &
	go run ${MAIN_PACKAGE_PATH}

.PHONY: clean
clean:
	rm -rf ${LOGS_DIR} ${BIN_DIR}/${BINARY_NAME} ${FRONTEND_DIR}/dist ${FRONTEND_DIR}/node_modules
