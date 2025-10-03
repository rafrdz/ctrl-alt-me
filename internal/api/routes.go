package api

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi/v5"
)

func (a *API) routes() *chi.Mux {
	r := chi.NewRouter()

	// API routes
	r.Route("/api", func(r chi.Router) {
		r.Get("/ping", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("pong"))
		})

		r.Get("/panic", func(w http.ResponseWriter, r *http.Request) {
			panic("test")
		})

		r.Route("/v1", func(r chi.Router) {
			r.Route("/job-applications", func(r chi.Router) {
				r.Post("/", a.handleCreateJobApplication)
				r.Get("/", a.handleGetAllJobApplications)
				r.Get("/{id}", a.handleGetJobApplicationByID)
				r.Put("/{id}", a.handleUpdateJobApplication)
				r.Delete("/{id}", a.handleDeleteJobApplication)
				r.Post("/import", a.handleImportJobApplicationsCSV)
			})
		})
	})

	// Serve static files from frontend/dist directory
	frontendPath := "./frontend/dist"
	if _, err := os.Stat(frontendPath); err == nil {
		// Create a file server for static assets
		fileServer := http.FileServer(http.Dir(frontendPath))

		// Handle static assets (js, css, images, etc.)
		r.Get("/assets/*", func(w http.ResponseWriter, r *http.Request) {
			// Set cache headers for assets
			w.Header().Set("Cache-Control", "public, max-age=31536000") // 1 year
			fileServer.ServeHTTP(w, r)
		})

		// Handle favicon
		r.Get("/favicon.ico", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Cache-Control", "public, max-age=86400") // 1 day
			fileServer.ServeHTTP(w, r)
		})

		// Handle SPA routing - serve index.html for non-API routes
		r.NotFound(func(w http.ResponseWriter, r *http.Request) {
			// Don't serve index.html for API routes
			if strings.HasPrefix(r.URL.Path, "/api/") {
				http.NotFound(w, r)
				return
			}

			// Serve index.html for SPA routes
			indexPath := filepath.Join(frontendPath, "index.html")
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			http.ServeFile(w, r, indexPath)
		})
	} else {
		// Fallback when frontend dist doesn't exist
		r.Get("/", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("Welcome to Ctrl-Alt-Me API - Frontend not built"))
		})
	}

	return r
}
