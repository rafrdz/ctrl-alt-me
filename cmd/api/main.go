package main

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/joho/godotenv"
	"github.com/rafrdz/ctrl-alt-me/internal/database"
	"github.com/rafrdz/ctrl-alt-me/internal/server"
	"github.com/rafrdz/ctrl-alt-me/internal/service"
)

const (
	DefaultBackendPort  = "3000"
	DefaultFrontendPort = "5173"
	DefaultDatabaseName = "job_applications.db"
	DefaultFrontendHost = "localhost"
)

type Config struct {
	Port         string
	FrontendPort string
	DatabaseName string
	FrontendHost string
}

func main() {
	// Configure the logger
	logger, logFile := configureLogger()
	defer logFile.Close()

	// Load environment variables
	config := createConfig(logger)
	logger.Debug("Environment variables loaded", "port", config.Port, "frontendPort", config.FrontendPort, "frontendHost", config.FrontendHost, "databaseName", config.DatabaseName)

	// Open connection to the database, this will be closed during graceful shutdown
	db, err := database.InitDB(config.DatabaseName, logger)
	if err != nil {
		logger.Error("Failed to initialize database", "error", err)
		os.Exit(1)
	}

	appService := service.NewJobApplicationService(db, logger)
	logger.Info("Application service initialized")

	// Set up the httpServer
	handler := server.NewHTTPHandler(appService, logger, config.FrontendHost, config.FrontendPort)
	httpServer := &http.Server{
		Addr:         ":" + config.Port,
		Handler:      handler,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 5 * time.Second,
	}

	// Start the HTTP httpServer and listen for termination signals
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Channel to communicate server startup errors
	serverErrors := make(chan error, 1)

	go func() {
		logger.Info("Starting HTTP server", "addr", httpServer.Addr)
		if err := httpServer.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("Failed to start HTTP server", "error", err)
			serverErrors <- err
		}
	}()

	time.Sleep(100 * time.Millisecond)
	logger.Info("HTTP server started successfully", "port", config.Port)

	// Wait for either shutdown signal or server error
	select {
	case <-ctx.Done():
		logger.Info("Received shutdown signal, stopping HTTP server...", "signal", ctx.Err())
	case err := <-serverErrors:
		logger.Error("Server failed to start", "error", err)
		if err := db.Close(); err != nil {
			logger.Error("Failed to close database during error cleanup", "error", err)
		}
		os.Exit(1)
	}

	// Graceful shutdown sequence
	stop()
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	logger.Info("Shutting down HTTP server...")
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		logger.Error("Error during HTTP server shutdown", "error", err)
		// Force close if graceful shutdown fails
		if closeErr := httpServer.Close(); closeErr != nil {
			logger.Error("Error during HTTP server force close", "error", closeErr)
		}
	} else {
		logger.Info("HTTP server shutdown gracefully")
	}

	logger.Info("Closing database connection...")
	if err := db.Close(); err != nil {
		logger.Error("Failed to close database", "error", err)
	} else {
		logger.Info("Database connection closed")
	}

	logger.Info("Application shutdown complete")
}

func createConfig(logger *slog.Logger) *Config {
	err := godotenv.Load()
	if err != nil {
		// Unable to load .env file, check for env variables or use defaults
		logger.Error("Error loading .env file, using env or default values")
	}

	return &Config{
		Port:         getEnvDefault("BACKEND_PORT", DefaultBackendPort),
		FrontendPort: getEnvDefault("FRONTEND_PORT", DefaultFrontendPort),
		DatabaseName: getEnvDefault("DATABASE_NAME", DefaultDatabaseName),
		FrontendHost: getEnvDefault("FRONTEND_HOST", DefaultFrontendHost),
	}
}

func getEnvDefault(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func configureLogger() (*slog.Logger, *os.File) {
	// Create a "logs" directory
	if err := os.MkdirAll("logs", 0755); err != nil {
		panic("Failed to create logs directory: " + err.Error())
	}

	// Create the daily log file
	logFileName := "logs/app-" + time.Now().Format("2006-01-02") + ".log"
	logFile, err := os.OpenFile(logFileName, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		panic("Failed to open log file: " + err.Error())
	}
	// Don't defer close here - return the file so main() can close it

	// Configure the logger with MultiWriter
	multiWriter := io.MultiWriter(os.Stdout, logFile)

	opts := &slog.HandlerOptions{
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			if a.Key == slog.TimeKey {
				a.Value = slog.TimeValue(a.Value.Time().UTC())
			}
			return a
		},
	}
	logLevel := &slog.LevelVar{}
	logLevel.Set(slog.LevelDebug)
	opts.Level = logLevel

	logger := slog.New(slog.NewJSONHandler(multiWriter, opts))
	logger.Info("Logger initialized", "logFile", logFileName)
	return logger, logFile
}
