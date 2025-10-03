package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"github.com/rafrdz/ctrl-alt-me/internal/cmd"
)

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()

	err := cmd.Execute(ctx, cancel)
	if err != nil {
		os.Exit(1)
	}
}
