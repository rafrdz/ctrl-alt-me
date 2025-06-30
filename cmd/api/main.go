package main

import (
	"log/slog"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/rafrdz/ctrl-alt-me/internal/database"
	"github.com/rafrdz/ctrl-alt-me/internal/server"
	"github.com/rafrdz/ctrl-alt-me/internal/service"
)

func main() {
	// Configure the logger
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
	logger := slog.New(slog.NewJSONHandler(os.Stdout, opts))
	logger.Debug("Logger initialized successfully")

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		logger.Error("Error loading .env file, using default values")
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	// Initialize the database
	db, err := database.InitDB(logger)
	if err != nil {
		logger.Error("Failed to initialize database", "error", err)
	}
	defer db.Close()

	appService := service.NewJobApplicationService(db)
	logger.Debug("Application service initialized successfully")

	// Set up the server
	server := server.NewServer(appService, logger)
	logger.Debug("Server is running", "port", port)
	if err := http.ListenAndServe(":"+port, server); err != nil {
		logger.Error("Failed to start server", "error", err)
	}

	// TODO: Correctly handle graceful shutdown
	logger.Debug("Server is stopping")
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		logger.Error("Error during server shutdown", "error", err)
	}
	logger.Debug("Server stopped gracefully")

	// Close the database connection
	if err := db.Close(); err != nil {
		logger.Error("Failed to close database", "error", err)
	}
}
