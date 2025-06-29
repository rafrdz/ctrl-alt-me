package database

import (
	"database/sql"
	"log/slog"

	_ "github.com/mattn/go-sqlite3"
)

const CreateTable = `
	CREATE TABLE IF NOT EXISTS jobs (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	company TEXT NOT NULL,
	position TEXT NOT NULL,
	link TEXT NOT NULL,
	status TEXT NOT NULL,
	notes TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

const InsertStmt = `INSERT INTO jobs (company, position, link, status, notes)VALUES (?, ?, ?, ?, ?)`
const SelectAllStmt = `SELECT * FROM jobs`
const SelectByIDStmt = `SELECT * FROM jobs WHERE id = ?`
const UpdateStmt = `UPDATE jobs SET company = ?, position = ?, link = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
const DeleteStmt = `DELETE FROM jobs WHERE id = ?`

func InitDB(logger *slog.Logger) (*sql.DB, error) {
	logger.Debug("Initializing database connection")
	db, err := sql.Open("sqlite3", "jobs.db")
	if err != nil {
		return nil, err
	}
	logger.Debug("Database connection established")

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
