package api

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/rafrdz/ctrl-alt-me/internal/config"
	"github.com/rafrdz/ctrl-alt-me/internal/database"
	"github.com/rafrdz/ctrl-alt-me/internal/service"
)

type API struct {
	db        *sql.DB
	server    *http.Server
	ctx       context.Context
	jobAppSvc *service.JobApplicationService
}

func NewAPI(cfg config.APIConfig) *API {
	d, err := database.Init(cfg)
	if err != nil {
		slog.Error("Failed to connect to the database", "error", err)
		return nil
	}
	// Don't defer d.Close() here, the API will manage the connection lifecycle
	slog.Info("Database connection established")

	a := &API{
		db:        d,
		ctx:       cfg.Context,
		jobAppSvc: service.NewJobApplicationService(d),
	}

	a.server = &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      a.routes(),
		IdleTimeout:  time.Minute,      // TODO: Make configurable
		ReadTimeout:  5 * time.Second,  // TODO: Make configurable
		WriteTimeout: 10 * time.Second, // TODO: Make configurable
	}

	return a
}

func (a *API) Start() error {
	serverErrors := make(chan error, 1)

	go func() {
		slog.Info("Starting HTTP server", "port", a.server.Addr)
		if err := a.server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("Failed to start HTTP server", "error", err)
			serverErrors <- err
		}
	}()

	time.Sleep(100 * time.Millisecond)
	slog.Info("HTTP server started successfully", "port", a.server.Addr)

	// Wait for either shutdown signal or server error
	select {
	case <-a.ctx.Done():
		slog.Info("Received shutdown signal, stopping HTTP server", "signal", a.ctx.Err())
	case err := <-serverErrors:
		slog.Error("Server failed to start", "error", err)
		if err := a.db.Close(); err != nil {
			slog.Error("Failed to close database during error cleanup", "error", err)
		}
		return err
	}

	// Graceful shutdown sequence
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var shutdownErr error

	slog.Info("Shutting down HTTP server")
	if err := a.server.Shutdown(shutdownCtx); err != nil {
		slog.Error("Error during HTTP server shutdown", "error", err)
		shutdownErr = err
		// Force close if graceful shutdown fails
		if closeErr := a.server.Close(); closeErr != nil {
			slog.Error("Error during HTTP server force close", "error", closeErr)
		}
	} else {
		slog.Info("HTTP server shutdown gracefully")
	}

	slog.Info("Closing database connection")
	if err := a.db.Close(); err != nil {
		slog.Error("Failed to close database", "error", err)
		if shutdownErr == nil {
			shutdownErr = err // Only set if no previous error
		}
	} else {
		slog.Info("Database connection closed")
	}

	if shutdownErr != nil {
		slog.Error("Application shutdown completed with errors", "error", shutdownErr)
		return fmt.Errorf("shutdown failed: %w", shutdownErr)
	}

	slog.Info("Application shutdown complete")
	return nil
}
