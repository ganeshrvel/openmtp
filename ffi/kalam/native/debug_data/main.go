package main

import (
	"fmt"
	"github.com/ganeshrvel/go-mtpx"
)

func main() {
	fmt.Println("======================================================")
	fmt.Println("start kalam debug log")
	fmt.Printf("------------------------------------------------------\n")

	dev, err := mtpx.Initialize(mtpx.Init{DebugMode: true})
	if err != nil {
		fmt.Printf("error initializing: %+v\n", err)

		fmt.Printf("\n")
		fmt.Println("end kalam debug log")
		fmt.Println("======================================================")

		return
	}
	fmt.Printf("\n------------------------------------------------------\n\n")

	info, err := mtpx.FetchDeviceInfo(dev)
	if err != nil {
		fmt.Printf("error fetching device info: %+v\n", err)
	}
	fmt.Printf("\n------------------------------------------------------\n\n")

	fmt.Printf("Storage: %+v\n", info)
	fmt.Printf("\n------------------------------------------------------\n\n")

	storages, err := mtpx.FetchStorages(dev)
	if err != nil {
		fmt.Printf("error fetching storages info: %+v\n", err)
	}
	fmt.Printf("Storage: %+v\n", storages)
	fmt.Printf("\n------------------------------------------------------\n\n")

	mtpx.Dispose(dev)

	fmt.Printf("\n\n")
	fmt.Println("end kalam debug log")
	fmt.Println("======================================================")
}
