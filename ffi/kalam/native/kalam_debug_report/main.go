package main

import (
	"github.com/ganeshrvel/go-mtpx"
	"log"
)

func main() {
	log.Println("======================================================")
	log.Println("start kalam debug log")
	log.Printf("------------------------------------------------------\n")

	dev, err := mtpx.Initialize(mtpx.Init{DebugMode: true})
	if err != nil {
		log.Printf("error initializing: %+v\n", err)

		log.Printf("\n")
		log.Println("end kalam debug log")
		log.Println("======================================================")

		return
	}
	log.Printf("\n------------------------------------------------------\n\n")

	info, err := mtpx.FetchDeviceInfo(dev)
	if err != nil {
		log.Printf("error fetching device info: %+v\n", err)
	}
	log.Printf("\n------------------------------------------------------\n\n")

	log.Printf("Storage: %+v\n", info)
	log.Printf("\n------------------------------------------------------\n\n")

	storages, err := mtpx.FetchStorages(dev)
	if err != nil {
		log.Printf("error fetching storages info: %+v\n", err)
	}
	log.Printf("Storage: %+v\n", storages)
	log.Printf("\n------------------------------------------------------\n\n")

	mtpx.Dispose(dev)

	log.Printf("\n\n")
	log.Println("end kalam debug log")
	log.Println("======================================================")
}
