package service

import (
	"context"
	"database/sql"
	"encoding/csv"
	"io"
	"log/slog"
	"time"

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

type ImportJobApplicationRequest struct {
	JobApplicationRequest
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

func (s *JobApplicationService) ImportJobApplicationsFromCSV(ctx context.Context, csvReader io.Reader) ([]JobApplicationResponse, error) {
	reader := csv.NewReader(csvReader)
	reader.FieldsPerRecord = -1

	records, err := reader.ReadAll()
	if err != nil {
		slog.Error("Failed to parse CSV file", "error", err)
		return nil, err
	}

	if len(records) == 0 {
		slog.Warn("CSV file is empty")
		return nil, nil
	}

	var jobApplications []ImportJobApplicationRequest
	for i, record := range records[1:] { // Skip header row
		if len(record) < 4 { // Minimum required fields: id, company, position, link
			slog.Warn("Skipping invalid CSV row", "row", i+2, "fields", len(record))
			continue
		}

		app := ImportJobApplicationRequest{
			JobApplicationRequest: JobApplicationRequest{
				Company:  record[1],
				Position: record[2],
			},
		}

		// Handle optional fields
		if len(record) > 3 && record[3] != "" {
			app.Link = record[3] // link
		}

		if len(record) > 4 && record[4] != "" {
			app.Status = record[4] // status
		} else {
			app.Status = "applied" // default status
		}

		if len(record) > 5 && record[5] != "" {
			app.Notes = record[5] // notes
		}

		if len(record) > 6 && record[6] != "" {
			createdAt, err := helpers.StringToSQLNullTime(record[6]) // created_at
			if err != nil {
				slog.Warn("Invalid created_at format, using current time", "row", i+2, "value", record[6], "error", err)
				createdAt = sql.NullTime{Time: time.Now()}
			}
			app.CreatedAt = createdAt.Time.Format(helpers.TimeFormat)
		} else {
			app.CreatedAt = time.Now().Format(helpers.TimeFormat)
		}

		if len(record) > 7 && record[7] != "" {
			updatedAt, err := helpers.StringToSQLNullTime(record[7]) // updated_at
			if err != nil {
				slog.Warn("Invalid updated_at format, using current time", "row", i+2, "value", record[7], "error", err)
				updatedAt = sql.NullTime{Time: time.Now()}
			}
			app.UpdatedAt = updatedAt.Time.Format(helpers.TimeFormat)
		} else {
			app.UpdatedAt = time.Now().Format(helpers.TimeFormat)
		}

		if app.Company == "" || app.Position == "" {
			slog.Warn("Skipping row with missing required fields",
				"row", i+2,
				"company", app.Company,
				"position", app.Position)
			continue
		}

		jobApplications = append(jobApplications, app)
	}

	if len(jobApplications) == 0 {
		slog.Warn("No valid job applications found in CSV")
		return nil, nil
	}

	slog.Info("Parsed job applications from CSV", "count", len(jobApplications))

	return s.ImportJobApplications(ctx, jobApplications)
}

func (s *JobApplicationService) ImportJobApplications(ctx context.Context, apps []ImportJobApplicationRequest) ([]JobApplicationResponse, error) {
	var importedApps []JobApplicationResponse

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		slog.Error("Failed to begin transaction for importing job applications", "error", err)
		return nil, err
	}

	q := s.queries.WithTx(tx)

	for _, app := range apps {
		createdAt, err := helpers.StringToSQLNullTime(app.CreatedAt)
		if err != nil {
			slog.Error("Failed to parse created_at timestamp", "error", err, "value", app.CreatedAt)
			if rbErr := tx.Rollback(); rbErr != nil {
				slog.Error("Failed to rollback transaction after timestamp parse failure", "error", rbErr)
			}
			return nil, err
		}

		updatedAt, err := helpers.StringToSQLNullTime(app.UpdatedAt)
		if err != nil {
			slog.Error("Failed to parse updated_at timestamp", "error", err, "value", app.UpdatedAt)
			if rbErr := tx.Rollback(); rbErr != nil {
				slog.Error("Failed to rollback transaction after timestamp parse failure", "error", rbErr)
			}
			return nil, err
		}

		params := database.ImportJobApplicationFromCSVParams{
			Company:   app.Company,
			Position:  app.Position,
			Link:      app.Link,
			Status:    database.JobStatus(app.Status),
			Notes:     app.Notes,
			CreatedAt: createdAt,
			UpdatedAt: updatedAt,
		}

		result, err := q.ImportJobApplicationFromCSV(ctx, params)
		if err != nil {
			slog.Error("Failed to import job application", "error", err, "company", app.Company, "position", app.Position)
			if rbErr := tx.Rollback(); rbErr != nil {
				slog.Error("Failed to rollback transaction after import failure", "error", rbErr)
			}
			return nil, err
		}

		importedApps = append(importedApps, JobApplicationResponse{
			ID: result.ID.String(),
			JobApplicationRequest: JobApplicationRequest{
				Company:  app.Company,
				Position: app.Position,
				Link:     app.Link,
				Status:   app.Status,
				Notes:    app.Notes,
			},
		})
		slog.Info("Imported job application successfully", "id", result.ID, "company", app.Company, "position", app.Position)
	}

	if err := tx.Commit(); err != nil {
		slog.Error("Failed to commit transaction for importing job applications", "error", err)
		return nil, err
	}

	slog.Info("Imported job applications successfully", "count", len(importedApps))
	return importedApps, nil
}
