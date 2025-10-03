package cmd

import (
	"context"
	"log/slog"

	"github.com/rafrdz/ctrl-alt-me/internal/logger"
	"github.com/spf13/cobra"
)

type contextKey string

const CancelFuncKey contextKey = "cancelFunc"

var (
	version string
	env     string
)

var rootCmd = &cobra.Command{
	Use:   "ctrlaltme",
	Short: "Ctrl-Alt-Me is a simple job application tracking tool",
	Long:  `A web application to help you track your job applications.`,
	PersistentPreRun: func(cmd *cobra.Command, args []string) {
		logger := logger.ConfigureLogger(env)
		slog.SetDefault(logger)
	},
	Run: func(cmd *cobra.Command, args []string) {
		slog.Info("Starting Ctrl-Alt-Me", "version", version, "env", env)
	},
}

func init() {
	rootCmd.PersistentFlags().StringVarP(&env, "env", "e", "development", "Application environment (development|staging|production)")
	rootCmd.PersistentFlags().StringVarP(&version, "version", "v", "dev", "Application version")
}

func Execute(ctx context.Context, cancel context.CancelFunc) error {
	ctxWithCancel := context.WithValue(ctx, CancelFuncKey, cancel)
	rootCmd.SetContext(ctxWithCancel)
	return rootCmd.ExecuteContext(ctxWithCancel)
}
