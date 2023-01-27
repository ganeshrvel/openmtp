package main

import (
	"fmt"
	"github.com/ganeshrvel/go-mtpx"
	jsoniter "github.com/json-iterator/go"
	"kalam/send_to_js"
	"log"
	"os"
	"strings"
	"time"
)

/*	#include "stdint.h"
	typedef void (* on_cb_result_t)(char*);
*/
import "C"

var container deviceContainer

//export Initialize
func Initialize(onDonePtr *C.on_cb_result_t) {
	sendToJsOnDonePtr := (*send_to_js.SendCbResult)(onDonePtr)

	if err := lockMtp(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	_, err := _initialize(mtpx.Init{DebugMode: false})
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	dInfo, err := _fetchDeviceInfo()
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	usbDesc, err := container.dev.GetUsbInfo()
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	send_to_js.SendInitialize(sendToJsOnDonePtr, dInfo, usbDesc)
}

//export FetchDeviceInfo
func FetchDeviceInfo(onDonePtr *C.on_cb_result_t) {
	sendToJsOnDonePtr := (*send_to_js.SendCbResult)(onDonePtr)

	if err := lockMtp(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	dInfo, err := _fetchDeviceInfo()
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	usbDesc, err := container.dev.GetUsbInfo()
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	send_to_js.SendDeviceInfo(sendToJsOnDonePtr, dInfo, usbDesc)
}

//export FetchStorages
func FetchStorages(onDonePtr *C.on_cb_result_t) {
	sendToJsOnDonePtr := (*send_to_js.SendCbResult)(onDonePtr)

	if err := lockMtp(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	_sendFetchStorages(true, sendToJsOnDonePtr)
}

func _sendFetchStorages(retry bool, onDonePtr *send_to_js.SendCbResult) {
	storages, err := _fetchStorages()

	if err != nil {
		if container.dev != nil && container.deviceInfo != nil {
			if strings.Contains(err.Error(), "EOF") {
				err = fmt.Errorf("error allow storage access. %+v", err.Error())

				// this is done to prevent samsung devices from returning usb timeouts
				_ = _dispose()
			}
		}

		send_to_js.SendError(onDonePtr, err)

		return
	}

	send_to_js.SendStorages(onDonePtr, storages)
}

//export MakeDirectory
func MakeDirectory(makeDirectoryInputJson *C.char, onDonePtr *C.on_cb_result_t) {
	sendToJsOnDonePtr := (*send_to_js.SendCbResult)(onDonePtr)

	if err := lockMtp(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	i := MakeDirectoryInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(makeDirectoryInputJson), &i)
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, fmt.Errorf("error occured while Unmarshalling MakeDirectory input data %+v: ", err))

		return
	}

	if err := _makeDirectory(i.StorageId, i.FullPath); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	send_to_js.SendMakeDirectory(sendToJsOnDonePtr)
}

//export FileExists
func FileExists(fileExistsInputJson *C.char, onDonePtr *C.on_cb_result_t) {
	sendToJsOnDonePtr := (*send_to_js.SendCbResult)(onDonePtr)

	if err := lockMtp(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	i := FileExistsInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(fileExistsInputJson), &i)
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, fmt.Errorf("error occured while Unmarshalling FileExists input data %+v: ", err))

		return
	}

	var fProps []mtpx.FileProp
	for _, f := range i.Files {
		fProp := mtpx.FileProp{FullPath: f}

		fProps = append(fProps, fProp)
	}

	fc, err := _fileExists(i.StorageId, fProps)
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	send_to_js.SendFileExists(sendToJsOnDonePtr, fc, i.Files)
}

//export DeleteFile
func DeleteFile(deleteFileInputJson *C.char, onDonePtr *C.on_cb_result_t) {
	sendToJsOnDonePtr := (*send_to_js.SendCbResult)(onDonePtr)

	if err := lockMtp(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	i := DeleteFileInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(deleteFileInputJson), &i)
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, fmt.Errorf("error occured while Unmarshalling DeleteFile input data %+v: ", err))

		return
	}

	var fProps []mtpx.FileProp
	for _, f := range i.Files {
		fProp := mtpx.FileProp{FullPath: f}

		fProps = append(fProps, fProp)
	}

	err = _deleteFile(i.StorageId, fProps)
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	send_to_js.SendDeleteFile(sendToJsOnDonePtr)
}

//export RenameFile
func RenameFile(renameFileInputJson *C.char, onDonePtr *C.on_cb_result_t) {
	sendToJsOnDonePtr := (*send_to_js.SendCbResult)(onDonePtr)

	if err := lockMtp(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	i := RenameFileInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(renameFileInputJson), &i)
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, fmt.Errorf("error occured while Unmarshalling RenameFile input data %+v: ", err))

		return
	}

	var fProp = mtpx.FileProp{
		FullPath: i.FullPath,
	}

	err = _renameFile(i.StorageId, fProp, i.NewFileName)
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	send_to_js.SendRenameFile(sendToJsOnDonePtr)
}

//export Walk
func Walk(walkInputJson *C.char, onDonePtr *C.on_cb_result_t) {
	sendToJsOnDonePtr := (*send_to_js.SendCbResult)(onDonePtr)

	if err := lockMtp(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	i := WalkInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(walkInputJson), &i)
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, fmt.Errorf("error occured while Unmarshalling Walk input data %+v: ", err))

		return
	}

	files, err := _walk(i.StorageId, i.FullPath, i.Recursive, i.SkipDisallowedFiles, i.SkipHiddenFiles)
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	send_to_js.SendWalk(sendToJsOnDonePtr, files)
}

//export UploadFiles
func UploadFiles(uploadFilesInputJson *C.char, onPreprocessPtr, onProgressPtr, onDonePtr *C.on_cb_result_t) {
	sendToJsOnPreprocessPtr := (*send_to_js.SendCbResult)(onPreprocessPtr)
	sendToJsOnProgressPtr := (*send_to_js.SendCbResult)(onProgressPtr)
	sendToJsOnDonePtr := (*send_to_js.SendCbResult)(onDonePtr)

	if err := lockMtp(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	i := UploadFilesInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(uploadFilesInputJson), &i)
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, fmt.Errorf("error occured while Unmarshalling UploadFiles input data %+v: ", err))

		return
	}

	var pInterface interface{}

	ch := make(chan bool)
	go func() {
		for {
			select {
			case <-ch:
				close(ch)

				return
			default:
				if pInterface != nil {
					switch v := pInterface.(type) {
					case UploadPreprocessContainer:
						send_to_js.SendUploadFilesPreprocess(sendToJsOnPreprocessPtr, v.fi, v.fullPath)

					case ProgressContainer:
						send_to_js.SendTransferFilesProgress(sendToJsOnProgressPtr, v.pInfo)

					default:
						log.Panicln("unimplemented UploadFiles.pInterface type")
					}
				}

				time.Sleep(time.Millisecond * 500)
			}
		}
	}()

	err = _uploadFiles(i.StorageId, i.Sources, i.Destination, i.PreprocessFiles,
		func(fi *os.FileInfo, fullPath string, err error) error {
			if err != nil {
				return err
			}

			pInterface = UploadPreprocessContainer{
				fi:       fi,
				fullPath: fullPath,
			}

			return nil
		},
		func(p *mtpx.ProgressInfo, err error) error {
			if err != nil {
				return err
			}

			pInterface = ProgressContainer{
				pInfo: p,
			}

			return nil
		})
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		ch <- true

		return
	}

	ch <- true

	send_to_js.SendTransferFilesDone(sendToJsOnDonePtr)
}

//export DownloadFiles
func DownloadFiles(downloadFilesInputJson *C.char, onPreprocessPtr, onProgressPtr, onDonePtr *C.on_cb_result_t) {
	sendToJsOnPreprocessPtr := (*send_to_js.SendCbResult)(onPreprocessPtr)
	sendToJsOnProgressPtr := (*send_to_js.SendCbResult)(onProgressPtr)
	sendToJsOnDonePtr := (*send_to_js.SendCbResult)(onDonePtr)

	if err := lockMtp(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	i := DownloadFilesInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(downloadFilesInputJson), &i)
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, fmt.Errorf("error occured while Unmarshalling DownloadFiles input data %+v: ", err))

		return
	}

	var pInterface interface{}

	ch := make(chan bool)
	go func() {
		for {
			select {
			case <-ch:
				close(ch)

				return
			default:
				if pInterface != nil {
					switch v := pInterface.(type) {
					case DownloadPreprocessContainer:
						send_to_js.SendDownloadFilesPreprocess(sendToJsOnPreprocessPtr, v.fi)

					case ProgressContainer:
						send_to_js.SendTransferFilesProgress(sendToJsOnProgressPtr, v.pInfo)

					default:
						log.Panicln("unimplemented DownloadFiles.pInterface type")
					}
				}

				time.Sleep(time.Millisecond * 500)
			}
		}
	}()

	err = _downloadFiles(i.StorageId, i.Sources, i.Destination, i.PreprocessFiles,
		func(fi *mtpx.FileInfo, err error) error {
			if err != nil {
				return err
			}

			pInterface = DownloadPreprocessContainer{
				fi: fi,
			}

			return nil
		},
		func(p *mtpx.ProgressInfo, err error) error {
			if err != nil {
				return err
			}

			pInterface = ProgressContainer{
				pInfo: p,
			}

			return nil
		})
	if err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		ch <- true

		return
	}

	ch <- true

	send_to_js.SendTransferFilesDone(sendToJsOnDonePtr)
}

//export Dispose
func Dispose(onDonePtr *C.on_cb_result_t) {
	sendToJsOnDonePtr := (*send_to_js.SendCbResult)(onDonePtr)

	if err := lockMtp(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	if err := _dispose(); err != nil {
		send_to_js.SendError(sendToJsOnDonePtr, err)

		return
	}

	container.dev = nil
	container.deviceInfo = nil

	send_to_js.SendDispose(sendToJsOnDonePtr)
}

func main() {}
