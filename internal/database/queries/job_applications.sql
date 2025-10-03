-- name: GetJobApplication :one
SELECT * FROM job_applications
WHERE id = $1 LIMIT 1;

-- name: ListJobApplications :many
SELECT * FROM job_applications
ORDER BY created_at DESC;

-- name: CreateJobApplication :one
INSERT INTO job_applications (
  company, position, link, status, notes
) VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *;

-- name: UpdateJobApplication :one
UPDATE job_applications
SET
  company = $1,
  position = $2,
  link = $3,
  status = $4,
  notes = $5,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $6
RETURNING *;

-- name: DeleteJobApplication :exec
DELETE FROM job_applications
WHERE id = $1;

-- name: ImportJobApplicationFromCSV :one
INSERT INTO job_applications (
  company, position, link, status, notes, created_at, updated_at
) VALUES (
  $1, $2, $3, $4, $5, $6, $7
)
RETURNING *;
