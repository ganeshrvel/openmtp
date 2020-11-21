package main

import (
	"github.com/ganeshrvel/go-mtpx"
	"github.com/ganeshrvel/kalam-mtp-kernel/send_to_js"
	"github.com/kr/pretty"
)
//todo remove mtpx.main()

//	#include "stdint.h"
import "C"

var container deviceContainer

//export Initialize
func Initialize(ptr int64) {
	_, err := _initialize(mtpx.Init{DebugMode: false})
	if err != nil {
		send_to_js.SendError(ptr, err)
	}

	dInfo, err := _fetchDeviceInfo()
	if err != nil {
		send_to_js.SendError(ptr, err)
	}

	send_to_js.SendInitialize(ptr, dInfo)
}

//export FetchDeviceInfo
func FetchDeviceInfo(ptr int64) {
	_, err := _fetchDeviceInfo()
	if err != nil {
		return //err
	}

	pretty.Println("deviceInfo: ", container.deviceInfo)
}

//export FetchStorages
func FetchStorages() () {
	storages, err := _fetchStorages()
	if err != nil {
		//throw storage error
		// reset the storage in the app

		return //err
	}

	pretty.Println("storages: ", storages)
}

//export Dispose
func Dispose() {
	if err := _dispose(); err != nil {
		return //err
	}

	container.dev = nil
	container.deviceInfo = nil
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

func main() {}
