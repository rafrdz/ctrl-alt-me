package service

import (
	"context"
	"database/sql"
	"log/slog"

	"github.com/google/uuid"
	"github.com/rafrdz/ctrl-alt-me/internal/database"
	"github.com/rafrdz/ctrl-alt-me/internal/helpers"
)

type JobApplicationService struct {
	db      *sql.DB
	queries *database.Queries
}

func NewJobApplicationService(db *sql.DB) *JobApplicationService {
	return &JobApplicationService{
		db:      db,
		queries: database.New(db),
	}
}

type JobApplicationRequest struct {
	Company  string `json:"company"`
	Position string `json:"position"`
	Link     string `json:"link"`
	Status   string `json:"status"`
	Notes    string `json:"notes"`
}

type JobApplicationResponse struct {
	ID string `json:"id"`
	JobApplicationRequest
}

type JobApplication struct {
	JobApplicationResponse
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func (s *JobApplicationService) CreateJobApplication(ctx context.Context, app JobApplicationRequest) (JobApplicationResponse, error) {
	params := database.CreateJobApplicationParams{
		Company:  app.Company,
		Position: app.Position,
		Link:     app.Link,
		Status:   database.JobStatus(app.Status),
		Notes:    app.Notes,
	}

	result, err := s.queries.CreateJobApplication(ctx, params)
	if err != nil {
		slog.Error("Failed to create job application", "error", err, "company", app.Company, "position", app.Position)
		return JobApplicationResponse{}, err
	}

	slog.Info("Job application created successfully", "id", result.ID, "company", app.Company, "position", app.Position)

	return JobApplicationResponse{
		ID:                    result.ID.String(),
		JobApplicationRequest: app,
	}, nil
}

func (s *JobApplicationService) GetAllJobApplications(ctx context.Context) ([]JobApplication, error) {
	rows, err := s.queries.ListJobApplications(ctx)
	if err != nil {
		slog.Error("Failed to retrieve job applications", "error", err)
		return nil, err
	}

	var applications []JobApplication
	for _, row := range rows {
		applications = append(applications, JobApplication{
			JobApplicationResponse: JobApplicationResponse{
				ID: row.ID.String(),
				JobApplicationRequest: JobApplicationRequest{
					Company:  row.Company,
					Position: row.Position,
					Link:     row.Link,
					Status:   string(row.Status),
					Notes:    row.Notes,
				},
			},
			CreatedAt: row.CreatedAt.Time.Format(helpers.TimeFormat),
			UpdatedAt: row.UpdatedAt.Time.Format(helpers.TimeFormat),
		})
	}

	slog.Info("Retrieved job applications successfully", "count", len(applications))
	return applications, nil
}

func (s *JobApplicationService) GetJobApplicationByID(ctx context.Context, id string) (JobApplication, error) {
	uuidID, err := parseUUID(id)
	if err != nil {
		return JobApplication{}, err
	}

	row, err := s.queries.GetJobApplication(ctx, uuidID)
	if err != nil {
		slog.Error("Failed to retrieve job application", "error", err, "id", id)
		return JobApplication{}, err
	}

	application := JobApplication{
		JobApplicationResponse: JobApplicationResponse{
			ID: row.ID.String(),
			JobApplicationRequest: JobApplicationRequest{
				Company:  row.Company,
				Position: row.Position,
				Link:     row.Link,
				Status:   string(row.Status),
				Notes:    row.Notes,
			},
		},
		CreatedAt: row.CreatedAt.Time.Format(helpers.TimeFormat),
		UpdatedAt: row.UpdatedAt.Time.Format(helpers.TimeFormat),
	}

	slog.Info("Retrieved job application successfully", "id", id)
	return application, nil
}

func (s *JobApplicationService) UpdateJobApplication(ctx context.Context, id string, app JobApplicationRequest) (JobApplicationResponse, error) {
	uuidID, err := parseUUID(id)
	if err != nil {
		return JobApplicationResponse{}, err
	}

	params := database.UpdateJobApplicationParams{
		ID:       uuidID,
		Company:  app.Company,
		Position: app.Position,
		Link:     app.Link,
		Status:   database.JobStatus(app.Status),
		Notes:    app.Notes,
	}

	result, err := s.queries.UpdateJobApplication(ctx, params)
	if err != nil {
		slog.Error("Failed to update job application", "error", err, "id", id)
		return JobApplicationResponse{}, err
	}

	slog.Info("Job application updated successfully", "id", result.ID, "company", app.Company, "position", app.Position)

	return JobApplicationResponse{
		ID:                    result.ID.String(),
		JobApplicationRequest: app,
	}, nil
}

func (s *JobApplicationService) DeleteJobApplication(ctx context.Context, id string) error {
	uuidID, err := parseUUID(id)
	if err != nil {
		return err
	}

	err = s.queries.DeleteJobApplication(ctx, uuidID)
	if err != nil {
		slog.Error("Failed to delete job application", "error", err, "id", id)
		return err
	}

	slog.Info("Job application deleted successfully", "id", id)
	return nil
}

func parseUUID(id string) (uuid.UUID, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		slog.Error("Invalid UUID format", "error", err, "id", id)
		return uuid.Nil, err
	}
	return uid, nil
}
