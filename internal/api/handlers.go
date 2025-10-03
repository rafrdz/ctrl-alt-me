package api

import (
	"encoding/json"
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/rafrdz/ctrl-alt-me/internal/service"
)

func (a *API) handleCreateJobApplication(w http.ResponseWriter, r *http.Request) {
	slog.Info("Received job application creation request",
		"method", r.Method,
		"path", r.URL.Path,
		"remote_addr", r.RemoteAddr)

	var newApp service.JobApplicationRequest
	if err := json.NewDecoder(r.Body).Decode(&newApp); err != nil {
		slog.Error("Failed to decode request body", "error", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	slog.Debug("Parsed job application data",
		"company", newApp.Company,
		"position", newApp.Position,
		"status", newApp.Status)

	ctx := r.Context()
	response, err := a.jobAppSvc.CreateJobApplication(ctx, newApp)
	if err != nil {
		slog.Error("Failed to create job application",
			"error", err,
			"company", newApp.Company,
			"position", newApp.Position)
		http.Error(w, "Failed to create job application", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		slog.Error("Failed to encode response", "error", err, "id", response.ID)
		return
	}

	slog.Debug("Response sent successfully", "id", response.ID)
}

func (a *API) handleGetAllJobApplications(w http.ResponseWriter, r *http.Request) {
	slog.Info("Received request to get all job applications",
		"method", r.Method,
		"path", r.URL.Path,
		"remote_addr", r.RemoteAddr)

	ctx := r.Context()
	applications, err := a.jobAppSvc.GetAllJobApplications(ctx)
	if err != nil {
		slog.Error("Failed to retrieve job applications", "error", err)
		http.Error(w, "Failed to retrieve job applications", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(applications); err != nil {
		slog.Error("Failed to encode response", "error", err)
		return
	}

	slog.Debug("Response sent successfully", "count", len(applications))
}

func (a *API) handleGetJobApplicationByID(w http.ResponseWriter, r *http.Request) {
	slog.Info("Received request to get job application by ID",
		"method", r.Method,
		"path", r.URL.Path,
		"remote_addr", r.RemoteAddr)

	ctx := r.Context()
	id := chi.URLParam(r, "id")

	application, err := a.jobAppSvc.GetJobApplicationByID(ctx, id)
	if err != nil {
		slog.Error("Failed to retrieve job application", "error", err, "id", id)
		http.Error(w, "Failed to retrieve job application", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(application); err != nil {
		slog.Error("Failed to encode response", "error", err, "id", id)
		return
	}

	slog.Debug("Response sent successfully", "id", id)
}

func (a *API) handleUpdateJobApplication(w http.ResponseWriter, r *http.Request) {
	slog.Info("Received request to update job application",
		"method", r.Method,
		"path", r.URL.Path,
		"remote_addr", r.RemoteAddr)

	var updatedApp service.JobApplicationRequest
	if err := json.NewDecoder(r.Body).Decode(&updatedApp); err != nil {
		slog.Error("Failed to decode request body", "error", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	id := chi.URLParam(r, "id")

	ctx := r.Context()
	response, err := a.jobAppSvc.UpdateJobApplication(ctx, id, updatedApp)
	if err != nil {
		slog.Error("Failed to update job application",
			"error", err,
			"id", id)
		http.Error(w, "Failed to update job application", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if err := json.NewEncoder(w).Encode(response); err != nil {
		slog.Error("Failed to encode response", "error", err, "id", response.ID)
		return
	}

	slog.Debug("Response sent successfully", "id", response.ID)
}

func (a *API) handleDeleteJobApplication(w http.ResponseWriter, r *http.Request) {
	slog.Info("Received request to delete job application",
		"method", r.Method,
		"path", r.URL.Path,
		"remote_addr", r.RemoteAddr)

	id := chi.URLParam(r, "id")

	ctx := r.Context()
	if err := a.jobAppSvc.DeleteJobApplication(ctx, id); err != nil {
		slog.Error("Failed to delete job application", "error", err, "id", id)
		http.Error(w, "Failed to delete job application", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
	slog.Debug("Job application deleted successfully", "id", id)
}

func (a *API) handleImportJobApplicationsCSV(w http.ResponseWriter, r *http.Request) {
	slog.Info("Received request to import job applications from CSV",
		"method", r.Method,
		"path", r.URL.Path,
		"remote_addr", r.RemoteAddr)

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		slog.Error("Failed to parse multipart form", "error", err)
		http.Error(w, "Invalid form data", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		slog.Error("Failed to retrieve file from form data", "error", err)
		http.Error(w, "Failed to retrieve file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	slog.Debug("Processing CSV file", "filename", header.Filename, "size", header.Size)

	ctx := r.Context()
	importedApps, err := a.jobAppSvc.ImportJobApplicationsFromCSV(ctx, file)
	if err != nil {
		slog.Error("Failed to import job applications from CSV", "error", err)
		http.Error(w, "Failed to import job applications", http.StatusInternalServerError)
		return
	}

	if len(importedApps) == 0 {
		slog.Warn("No job applications were imported")
		http.Error(w, "No valid job applications found in CSV", http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)

	if err := json.NewEncoder(w).Encode(importedApps); err != nil {
		slog.Error("Failed to encode response", "error", err)
		return
	}

	slog.Info("Job applications imported successfully",
		"count", len(importedApps),
		"filename", header.Filename)
}
