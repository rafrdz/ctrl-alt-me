package frontend

import (
	"embed"
	"io/fs"
)

//go:embed dist/*
var embedFS embed.FS

func StaticFiles() fs.FS {
	staticFiles, err := fs.Sub(embedFS, "dist")
	if err != nil {
		panic("failed to get static files: " + err.Error())
	}
	return staticFiles
}
