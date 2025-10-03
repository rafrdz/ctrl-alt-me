package cmd

import (
	"log/slog"
	"time"

	"github.com/rafrdz/ctrl-alt-me/internal/api"
	"github.com/rafrdz/ctrl-alt-me/internal/config"
	"github.com/spf13/cobra"
)

var cfg config.APIConfig

var apiCmd = &cobra.Command{
	Use:   "api",
	Short: "Run the Ctrl-Alt-Me API server",
	Long:  `Starts the API server for the Ctrl-Alt-Me job application tracking tool.`,
	Run: func(cmd *cobra.Command, args []string) {
		ctx := cmd.Context()
		cfg.Context = ctx

		a := api.NewAPI(cfg)
		if a == nil {
			slog.Error("Failed to initialize API")
			return
		}

		if err := a.Start(); err != nil {
			slog.Error("API server stopped with error", "error", err)
		}
	},
}

func init() {
	// Application flags
	apiCmd.PersistentFlags().IntVarP(&cfg.Port, "port", "p", 3000, "Port to run the server on")

	// Database flags
	apiCmd.PersistentFlags().StringVar(&cfg.DBDSN, "db-dsn", "", "PostgreSQL DSN")
	apiCmd.PersistentFlags().IntVar(&cfg.DBMaxOpenConns, "db-max-open-conns", 10, "PostgreSQL max open connections")
	apiCmd.PersistentFlags().IntVar(&cfg.DBMaxIdleConns, "db-max-idle-conns", 5, "PostgreSQL max idle connections")
	apiCmd.PersistentFlags().DurationVarP(&cfg.DBMaxIdleTime, "db-max-idle-time", "t", 5*time.Minute, "PostgreSQL max idle time")

	rootCmd.AddCommand(apiCmd)
}
