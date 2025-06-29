package server

import (
	"fmt"
	"log/slog"
	"net/http"
)

func handlePing(logger *slog.Logger) http.Handler {
	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			logger.Debug("Received ping request", "method", r.Method, "url", r.URL.String())
			fmt.Fprintf(w, "pong")
		})
}
