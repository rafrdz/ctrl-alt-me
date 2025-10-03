package logger

import (
	"log/slog"
	"os"
)

func ConfigureLogger(env string) *slog.Logger {
	opts := &slog.HandlerOptions{
		ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
			if a.Key == slog.TimeKey {
				a.Value = slog.TimeValue(a.Value.Time().UTC())
			}
			return a
		},
	}

	logLevel := &slog.LevelVar{}
	switch env {
	case "production":
		logLevel.Set(slog.LevelInfo)
	case "staging":
		logLevel.Set(slog.LevelDebug)
	default:
		logLevel.Set(slog.LevelDebug)
	}
	opts.Level = logLevel

	logger := slog.New(slog.NewJSONHandler(os.Stdout, opts))
	return logger
}
