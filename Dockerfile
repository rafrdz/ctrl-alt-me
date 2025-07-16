FROM node:lts-alpine AS frontend_builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

RUN ls -al

FROM golang:1.24-alpine AS backend_builder

WORKDIR /app/backend

RUN apk add --no-cache make build-base

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN make build-backend

FROM alpine:latest

WORKDIR /app

COPY --from=frontend_builder /app/frontend/dist /app/frontend/dist

COPY --from=backend_builder /app/backend/bin/api /app/bin/api

COPY --from=backend_builder /app/backend/scripts /app/scripts

EXPOSE 8080

CMD ["/app/bin/api"]
