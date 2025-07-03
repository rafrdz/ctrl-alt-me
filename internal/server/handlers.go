package server

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"

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

			reader := csv.NewReader(r.Body)

			var records [][]string

			for {
				record, err := reader.Read()

				if err == io.EOF {
					break
				}

				if err != nil {
					logger.Error("Failed to read CSV record", "error", err)
					http.Error(w, "Failed to read CSV record", http.StatusBadRequest)
					return
				}

				records = append(records, record)
			}

			jobAppSvc.ImportJobApplicationsFromCSV(records)

			// Process the CSV records as needed
			logger.Info("CSV records processed", "count", len(records))

			w.WriteHeader(http.StatusOK)
			fmt.Fprintln(w, "CSV file uploaded successfully")
		})
}
