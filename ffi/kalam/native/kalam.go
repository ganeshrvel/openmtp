package main

import (
	"github.com/ganeshrvel/go-mtpfs/mtp"
	"github.com/ganeshrvel/go-mtpx"
)
//todo remove mtpx.main()

//	#include "stdint.h"
import "C"

var d *mtp.Device

//todo remove
var Sid uint32

//export Initialize
func Initialize() {
	dev, err := mtpx.Initialize(mtpx.Init{DebugMode: true})

	if err != nil {
		return
	}

	d = dev
}

//export FetchDeviceInfo
func FetchDeviceInfo() {
	_, err := mtpx.FetchDeviceInfo(d)
	if err != nil {
		return
	}
}

//export FetchStorages
func FetchStorages() uint32 {
	storages, err := mtpx.FetchStorages(d)
	if err != nil {
		return 0
	}

	Sid = storages[0].Sid

	return storages[0].Sid
}

////export Walk
//func Walk(fullPath *C.char, storageId int, ptr int64) {
//	_fullPath := C.GoString(fullPath)
//	pretty.Println("_fullPath:", _fullPath)
//	pretty.Println("storageId:", uint32(storageId))
//
//	decode_native.SendWalkResult(ptr, d, uint32(storageId), _fullPath)
//}
//
////export UploadFiles
//func UploadFiles(ptr int64) {
//	start := time.Now()
//	uploadFile1 := getTestMocksAsset("test-large-files")
//	sources := []string{uploadFile1}
//	destination := "/mtp-test-files/temp_dir/test_UploadFiles"
//	objectIdDest, totalFiles, totalSize, err := mtpx.UploadFiles(d, Sid,
//		sources,
//		destination,
//		func(fi *mtpx.TransferredFileInfo, err error) error {
//			pretty.Printf("Filename: %s\n", fi.FileInfo.Name)
//			pretty.Printf("Speed: %d MB/s\n", fi.Speed)
//
//			decode_native.UploadFilesCb(ptr, fi)
//			return nil
//		},
//	)
//
//	if err != nil {
//		return
//	}
//
//	pretty.Println(objectIdDest)
//	pretty.Println(totalFiles)
//	pretty.Println(totalSize)
//	pretty.Println("time elapsed: ", time.Since(start).Seconds())
//}
//
///// [sourcesJson] source list string slice in json format
////export DownloadFiles
//func DownloadFiles(sourcesJson, destination *C.char, ptr int64) {
//	var sources []string
//
//	_sourcesJson := C.GoString(sourcesJson)
//	_destination := C.GoString(destination)
//
//	var json = jsoniter.ConfigFastest
//	err := json.UnmarshalFromString(_sourcesJson, &sources)
//	if err != nil {
//		return
//	}
//
//	_, _, err = mtpx.DownloadFiles(d, Sid,
//		sources, _destination,
//		func(downloadFi *mtpx.TransferredFileInfo, err error) error {
//			fmt.Printf("Current filepath: %s\n", downloadFi.FileInfo.FullPath)
//			fmt.Printf("%f MB/s\n", downloadFi.Speed)
//
//			return nil
//		},
//	)
//	if err != nil {
//		return
//	}
//
//	//pretty.Println(totalFiles)
//	//pretty.Println(totalSize)
//	//pretty.Println("time elapsed: ", time.Since(start).Seconds())
//}

func main() {
	Initialize()
}
