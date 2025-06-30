package service

import (
	"database/sql"

	"github.com/rafrdz/ctrl-alt-me/internal/database"
)

type JobApplicationService struct {
	db *sql.DB
}

func NewJobApplicationService(db *sql.DB) *JobApplicationService {
	return &JobApplicationService{db: db}
}

type NewJobApplication struct {
	Company  string `json:"company"`
	Position string `json:"position"`
	Link     string `json:"link"`
	Status   string `json:"status"`
	Notes    string `json:"notes"`
}

type NewJobApplicationResponse struct {
	ID int64 `json:"id"`
	NewJobApplication
}

type JobApplication struct {
	ID int64 `json:"id"`
	NewJobApplication
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

func (s *JobApplicationService) CreateJobApplication(app NewJobApplication) (NewJobApplicationResponse, error) {
	stmt, err := s.db.Prepare(database.InsertStmt)
	if err != nil {
		return NewJobApplicationResponse{}, err
	}
	defer stmt.Close()

	res, err := stmt.Exec(app.Company, app.Position, app.Link, app.Status, app.Notes)
	if err != nil {
		return NewJobApplicationResponse{}, err
	}

	id, err := res.LastInsertId()
	if err != nil {
		return NewJobApplicationResponse{}, err
	}

	return NewJobApplicationResponse{
		ID:                id,
		NewJobApplication: app,
	}, nil
}

func (s *JobApplicationService) GetJobApplicationByID(id string) (JobApplication, error) {
	stmt, err := s.db.Prepare(database.SelectByIDStmt)
	if err != nil {
		return JobApplication{}, err
	}
	defer stmt.Close()

	var app JobApplication
	err = stmt.QueryRow(id).Scan(&app.ID, &app.Company, &app.Position, &app.Link, &app.Status, &app.Notes)
	if err != nil {
		if err == sql.ErrNoRows {
			return JobApplication{}, nil
		}
		return JobApplication{}, err
	}

	return app, nil
}

func (s *JobApplicationService) GetJobApplications() ([]JobApplication, error) {
	stmt, err := s.db.Prepare(database.SelectAllStmt)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	rows, err := stmt.Query()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var applications []JobApplication
	for rows.Next() {
		var app JobApplication
		err = rows.Scan(&app.ID, &app.Company, &app.Position, &app.Link, &app.Status, &app.Notes, &app.CreatedAt, &app.UpdatedAt)
		if err != nil {
			return nil, err
		}
		applications = append(applications, app)
	}

	return applications, nil
}

func (s *JobApplicationService) UpdateJobApplication(app JobApplication) (JobApplication, error) {
	stmt, err := s.db.Prepare(database.UpdateStmt)
	if err != nil {
		return JobApplication{}, err
	}
	defer stmt.Close()

	_, err = stmt.Exec(app.Company, app.Position, app.Link, app.Status, app.Notes, app.ID)
	if err != nil {
		return JobApplication{}, err
	}
	return app, nil
}

func (s *JobApplicationService) DeleteJobApplication(id string) error {
	stmt, err := s.db.Prepare(database.DeleteStmt)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(id)
	if err != nil {
		return err
	}
	return nil
}
