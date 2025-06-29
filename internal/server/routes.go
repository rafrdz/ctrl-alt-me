package server

import (
	"log/slog"
	"net/http"
)

func addRoutes(mux *http.ServeMux, logger *slog.Logger) {
	logger.Debug("Adding routes to the server")
	mux.Handle("/ping", handlePing(logger))
}
