package config

import (
	"context"
	"time"
)

type APIConfig struct {
	Port           int
	DBDSN          string
	DBMaxOpenConns int
	DBMaxIdleConns int
	DBMaxIdleTime  time.Duration
	Context        context.Context
}
