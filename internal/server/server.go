package server

import (
	"log/slog"
	"net/http"

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
	mux.Handle("/", handleSPA(staticFiles, logger))

	// Wrap the mux with CORS middleware
	return corsMiddleware(mux, frontendHost, frontendPort)
}
