package server

import (
	"log/slog"
	"net/http"

	"github.com/rafrdz/ctrl-alt-me/internal/service"
)

func NewServer(appService *service.JobApplicationService, logger *slog.Logger, frontendPort string) http.Handler {
	mux := http.NewServeMux()

	mux.Handle("/ping", handlePing(logger))
	mux.Handle("POST /job-applications", handleCreateJobApplication(appService, logger))
	mux.Handle("GET /job-applications/{id}", handleGetJobApplicationByID(appService, logger))
	mux.Handle("GET /job-applications", handleGetJobApplications(appService, logger))
	mux.Handle("PUT /job-applications", handleUpdateJobApplication(appService, logger))
	mux.Handle("DELETE /job-applications/{id}", handleDeleteJobApplication(appService, logger))
	logger.Debug("Routes added successfully")
	logger.Debug("CORS middleware is being applied", "frontendPort", frontendPort)

	// Wrap the mux with CORS middleware
	return corsMiddleware(mux, frontendPort)
}
