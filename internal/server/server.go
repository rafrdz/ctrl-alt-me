package server

import (
	"log/slog"
	"net/http"
)

func NewServer(logger *slog.Logger) *http.ServeMux {
	mux := http.NewServeMux()
	addRoutes(mux, logger)
	return mux
}
