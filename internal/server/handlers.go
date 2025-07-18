package server

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"log/slog"
	"net/http"
	"path"
	"strings"
	"time"

	"github.com/rafrdz/ctrl-alt-me/internal/service"
)

func handlePing(logger *slog.Logger) http.Handler {
	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			logger.Debug("Received ping request", "method", r.Method, "url", r.URL.String())
			fmt.Fprintf(w, "pong")
		})
}

func handleCreateJobApplication(jobAppSvc *service.JobApplicationService, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			logger.Debug("Received create application request", "method", r.Method, "url", r.URL.String())

			var na service.NewJobApplication

			err := json.NewDecoder(r.Body).Decode(&na)
			if err != nil {
				logger.Error("Failed to decode request body", "error", err)
				http.Error(w, "Invalid request body", http.StatusBadRequest)
				return
			}

			a, err := jobAppSvc.CreateJobApplication(na)
			if err != nil {
				logger.Error("Failed to create job application", "error", err)
				http.Error(w, "Failed to create job application", http.StatusInternalServerError)
				return
			}

			aJSON, err := json.Marshal(a)
			if err != nil {
				logger.Error("Failed to marshal job application", "error", err)
				http.Error(w, "Failed to create job application", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			w.Write(aJSON)
		})
}

func handleGetJobApplications(jobAppSvc *service.JobApplicationService, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			logger.Debug("Received get applications request", "method", r.Method, "url", r.URL.String())

			apps, err := jobAppSvc.GetJobApplications()
			if err != nil {
				logger.Error("Failed to get job applications", "error", err)
				http.Error(w, "Failed to get job applications", http.StatusInternalServerError)
				return
			}

			appsJSON, err := json.Marshal(apps)
			if err != nil {
				logger.Error("Failed to marshal job applications", "error", err)
				http.Error(w, "Failed to get job applications", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(appsJSON)
		})
}

func handleGetJobApplicationByID(jobAppSvc *service.JobApplicationService, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			logger.Debug("Received get application by ID request", "method", r.Method, "url", r.URL.String())

			id := r.PathValue("id")

			a, err := jobAppSvc.GetJobApplicationByID(id)
			if err != nil {
				logger.Error("Failed to get job application", "error", err)
				http.Error(w, "Failed to get job application", http.StatusInternalServerError)
				return
			}

			aJSON, err := json.Marshal(a)
			if err != nil {
				logger.Error("Failed to marshal job application", "error", err)
				http.Error(w, "Failed to get job application", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(aJSON)
		})
}

func handleUpdateJobApplication(jobAppSvc *service.JobApplicationService, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			logger.Debug("Received update application request", "method", r.Method, "url", r.URL.String(), "body", r.Body)

			var app service.JobApplication
			err := json.NewDecoder(r.Body).Decode(&app)
			if err != nil {
				logger.Error("Failed to decode request body", "error", err)
				http.Error(w, "Invalid request body", http.StatusBadRequest)
				return
			}

			updatedApp, err := jobAppSvc.UpdateJobApplication(app)
			if err != nil {
				logger.Error("Failed to update job application", "error", err)
				http.Error(w, "Failed to update job application", http.StatusInternalServerError)
				return
			}

			updatedAppJSON, err := json.Marshal(updatedApp)
			if err != nil {
				logger.Error("Failed to marshal updated job application", "error", err)
				http.Error(w, "Failed to update job application", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(updatedAppJSON)
		})
}

func handleDeleteJobApplication(jobAppSvc *service.JobApplicationService, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			logger.Debug("Received delete application request", "method", r.Method, "url", r.URL.String())

			id := r.PathValue("id")
			err := jobAppSvc.DeleteJobApplication(id)
			if err != nil {
				logger.Error("Failed to delete job application", "error", err)
				http.Error(w, "Failed to delete job application", http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNoContent)
		})
}

func handleCSVUpload(jobAppSvc *service.JobApplicationService, logger *slog.Logger) http.Handler {
	return http.HandlerFunc(
		func(w http.ResponseWriter, r *http.Request) {
			logger.Debug("Received CSV upload request", "method", r.Method, "url", r.URL.String())

			err := r.ParseMultipartForm(10 << 20) // 10 MB limit
			if err != nil {
				logger.Error("Failed to parse multipart form", "error", err)
				http.Error(w, "Failed to parse multipart form", http.StatusBadRequest)
				return
			}

			file, _, err := r.FormFile("file")
			if err != nil {
				logger.Error("Failed to get file from form", "error", err)
				http.Error(w, "Failed to get file from form", http.StatusBadRequest)
				return
			}
			defer file.Close()

			reader := csv.NewReader(file)
			records, err := reader.ReadAll()
			if err != nil {
				logger.Error("Failed to read CSV records", "error", err)
				http.Error(w, "Failed to read CSV records", http.StatusBadRequest)
				return
			}

			// Skip header row if present
			if len(records) > 0 && len(records[0]) > 0 {
				firstRow := records[0]
				if len(firstRow) >= 5 && (strings.ToLower(firstRow[0]) == "date" || strings.ToLower(firstRow[0]) == "company") {
					records = records[1:]
				}
			}

			applications, err := jobAppSvc.ImportJobApplicationsFromCSV(records)
			if err != nil {
				logger.Error("Failed to import job applications", "error", err)
				http.Error(w, "Failed to import job applications: "+err.Error(), http.StatusInternalServerError)
				return
			}

			logger.Info("CSV records processed successfully", "count", len(applications))

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			response := map[string]interface{}{
				"message":  "CSV file uploaded successfully",
				"imported": len(applications),
			}
			json.NewEncoder(w).Encode(response)
		})
}

// handleSPA handles serving static files and SPA routing
func handleSPA(staticFS fs.FS, logger *slog.Logger) http.Handler {
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
