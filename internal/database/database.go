package database

import (
	"database/sql"
	"log/slog"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

const CreateTable = `
	CREATE TABLE IF NOT EXISTS job_applications (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	company TEXT NOT NULL,
	position TEXT NOT NULL,
	link TEXT NOT NULL,
	status TEXT NOT NULL,
	notes TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

const InsertStmt = `INSERT INTO job_applications (company, position, link, status, notes) VALUES (?, ?, ?, ?, ?)`
const SelectAllStmt = `SELECT * FROM job_applications`
const SelectByIDStmt = `SELECT * FROM job_applications WHERE id = ?`
const UpdateStmt = `UPDATE job_applications SET company = ?, position = ?, link = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
const DeleteStmt = `DELETE FROM job_applications WHERE id = ?`
const ImportStmt = `INSERT INTO job_applications (company, position, link, status, notes, created_at) VALUES (?, ?, ?, ?, ?, ?)`

func InitDB(dbName string, logger *slog.Logger) (*sql.DB, error) {
	// Create the data directory if it doesn't exist
	if err := os.MkdirAll("data", 0755); err != nil {
		return nil, err
	}

	dbPath := filepath.Join("data", dbName)

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, err
	}
	logger.Info("Database connection initialized", "driver", "sqlite3", "database", dbPath)

	stmt, err := db.Prepare(CreateTable)
	if err != nil {
		return nil, err
	}
	defer stmt.Close()

	_, err = stmt.Exec()
	if err != nil {
		return nil, err
	}
	return db, nil
}
