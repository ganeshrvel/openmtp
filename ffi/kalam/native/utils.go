package main

import (
	"os"
)

func isDirLocal(name string) bool {
	if fi, err := os.Stat(name); err == nil {
		if fi.Mode().IsDir() {
			return true
		}
	}
	return false
}

func existsLocal(filename string) bool {
	_, err := os.Stat(filename)

	return !os.IsNotExist(err)
}
