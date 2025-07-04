FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache make build-base

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN make build

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/ctrl-alt-me-api /app/ctrl-alt-me-api

EXPOSE 3000

CMD ["/app/ctrl-alt-me-api"]
