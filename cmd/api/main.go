package main

import (
	"io"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/rafrdz/ctrl-alt-me/internal/database"
	"github.com/rafrdz/ctrl-alt-me/internal/server"
	"github.com/rafrdz/ctrl-alt-me/internal/service"
)

const (
	DEFAULT_BACKEND_PORT  = "3000"
	DEFAULT_FRONTEND_PORT = "5173"
	DEFAULT_DATABASE_NAME = "job_applications.db"
	DEFAULT_FRONTEND_HOST = "localhost"
)

type Config struct {
	Port         string
	FrontendHost string
	FrontendPort string
	DatabaseName string
}

func main() {
	// Configure the logger
	logger, logFile := configureLogger()
	defer logFile.Close() // Close the log file when main() exits

	// Load environment variables
	config := createConfig(logger)
	logger.Debug("Environment variables loaded", "port", config.Port, "frontendHost", config.FrontendHost, "frontendPort", config.FrontendPort, "databaseName", config.DatabaseName)

	// Initialize the database
	db, err := database.InitDB(config.DatabaseName, logger)
	if err != nil {
		logger.Error("Failed to initialize database", "error", err)
	}
	defer db.Close()

	appService := service.NewJobApplicationService(db, logger)
	logger.Info("Application service initialized")

	// Set up the server
	server := server.NewServer(appService, logger, config.FrontendHost, config.FrontendPort)
	logger.Debug("Server is running", "port", config.Port)
	if err := http.ListenAndServe(":"+config.Port, server); err != nil {
		logger.Error("Failed to start server", "error", err)
	}

	// TODO: Correctly handle graceful shutdown
	logger.Debug("Server is stopping")
	if err := http.ListenAndServe(":"+config.Port, nil); err != nil {
		logger.Error("Error during server shutdown", "error", err)
	}
	logger.Debug("Server stopped gracefully")

	// Close the database connection
	if err := db.Close(); err != nil {
		logger.Error("Failed to close database", "error", err)
	}
}

func createConfig(logger *slog.Logger) *Config {
	// Load environment variables in development mode
	// In production, these should be set in the environment or Docker container
	// Use godotenv to load .env file if it exists
	err := godotenv.Load()
	if err != nil {
		logger.Error("Error loading .env file, using default values")
	}

	return &Config{
		Port:         getEnvDefault("BACKEND_PORT", DEFAULT_BACKEND_PORT),
		FrontendPort: getEnvDefault("FRONTEND_PORT", DEFAULT_FRONTEND_PORT),
		DatabaseName: getEnvDefault("DATABASE_NAME", DEFAULT_DATABASE_NAME),
		FrontendHost: getEnvDefault("FRONTEND_HOST", DEFAULT_FRONTEND_HOST),
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
