package helpers

import (
	"database/sql"
	"time"
)

const TimeFormat = "2006-01-02 15:04:05"
const ISO8601Format = "2006-01-02T15:04:05Z"

func StringToSQLNullTime(s string) (sql.NullTime, error) {
	if s == "" {
		return sql.NullTime{Valid: false}, nil
	}

	// Try multiple time formats
	formats := []string{
		time.RFC3339,          // "2006-01-02T15:04:05Z07:00"
		ISO8601Format,         // "2006-01-02T15:04:05Z"
		TimeFormat,            // "2006-01-02 15:04:05"
		"2006-01-02",          // Date only
		"2006-01-02T15:04:05", // ISO without timezone
	}

	for _, format := range formats {
		if t, err := time.Parse(format, s); err == nil {
			return sql.NullTime{Time: t, Valid: true}, nil
		}
	}

	// If none of the formats work, return an error
	return sql.NullTime{Valid: false}, &time.ParseError{
		Layout:  "multiple formats",
		Value:   s,
		Message: "time string does not match any supported format",
	}
}
