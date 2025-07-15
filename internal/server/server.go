package server

import (
	"io"
	"io/fs"
	"log/slog"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/rafrdz/ctrl-alt-me/frontend"
	"github.com/rafrdz/ctrl-alt-me/internal/service"
)

func NewServer(appService *service.JobApplicationService, logger *slog.Logger, frontendHost, frontendPort string) http.Handler {
	mux := http.NewServeMux()

	// API routes
	mux.Handle("/ping", handlePing(logger))
	mux.Handle("POST /api/job-applications", handleCreateJobApplication(appService, logger))
	mux.Handle("GET /api/job-applications/{id}", handleGetJobApplicationByID(appService, logger))
	mux.Handle("GET /api/job-applications", handleGetJobApplications(appService, logger))
	mux.Handle("PUT /api/job-applications", handleUpdateJobApplication(appService, logger))
	mux.Handle("DELETE /api/job-applications/{id}", handleDeleteJobApplication(appService, logger))
	mux.Handle("POST /api/job-applications/import", handleCSVUpload(appService, logger))

	// Serve static files and handle SPA routing
	staticFiles := frontend.StaticFiles()
	mux.Handle("/", spaHandler(staticFiles, logger))

	// Wrap the mux with CORS middleware
	return corsMiddleware(mux, frontendHost, frontendPort)
}

// spaHandler handles serving static files and SPA routing
func spaHandler(staticFS fs.FS, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Clean the path
		cleanPath := path.Clean(r.URL.Path)

		// Remove leading slash for fs.FS
		if cleanPath == "/" {
			cleanPath = "index.html"
		} else {
			cleanPath = strings.TrimPrefix(cleanPath, "/")
		}

		// Try to serve the requested file
		file, err := staticFS.Open(cleanPath)
		if err != nil {
			// If file doesn't exist and it's not an API route, serve index.html (SPA routing)
			if !strings.HasPrefix(r.URL.Path, "/api/") {
				logger.Debug("File not found, serving index.html for SPA routing", "path", r.URL.Path)
				indexFile, indexErr := staticFS.Open("index.html")
				if indexErr != nil {
					logger.Error("Failed to open index.html", "error", indexErr)
					http.Error(w, "Internal Server Error", http.StatusInternalServerError)
					return
				}
				defer indexFile.Close()

				w.Header().Set("Content-Type", "text/html")
				http.ServeContent(w, r, "index.html", time.Time{}, indexFile.(io.ReadSeeker))
				return
			}

			logger.Debug("File not found", "path", r.URL.Path, "error", err)
			http.NotFound(w, r)
			return
		}
		defer file.Close()

		// Serve the file
		http.ServeContent(w, r, cleanPath, time.Time{}, file.(io.ReadSeeker))
	})
}
