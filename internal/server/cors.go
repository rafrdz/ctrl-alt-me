package server

import (
	"net/http"
)

// corsMiddleware adds CORS headers to allow cross-origin requests from the frontend
func corsMiddleware(next http.Handler, frontendHost, frontendPort string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://"+frontendHost+":"+frontendPort) // TODO: Support HTTPS
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "3600")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Continue with the next handler
		next.ServeHTTP(w, r)
	})
}
