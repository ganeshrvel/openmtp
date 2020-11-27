package main

import (
	"./send_to_js"
	"fmt"
	"github.com/ganeshrvel/go-mtpx"
	jsoniter "github.com/json-iterator/go"
	"log"
	"os"
	"strings"
	"time"
)

//	#include "stdint.h"
import "C"

var container deviceContainer

//export Initialize
func Initialize(ptr int64) {
	_, err := _initialize(mtpx.Init{DebugMode: false})
	if err != nil {
		send_to_js.SendError(ptr, err)

		return
	}

	dInfo, err := _fetchDeviceInfo()
	if err != nil {
		send_to_js.SendError(ptr, err)

		return
	}

	send_to_js.SendInitialize(ptr, dInfo)
}

//export FetchDeviceInfo
func FetchDeviceInfo(ptr int64) {
	dInfo, err := _fetchDeviceInfo()
	if err != nil {
		send_to_js.SendError(ptr, err)

		return
	}

	send_to_js.SendDeviceInfo(ptr, dInfo)
}

//export FetchStorages
func FetchStorages(ptr int64) {
	_sendFetchStorages(ptr, true)
}

func _sendFetchStorages(ptr int64, retry bool) {
	storages, err := _fetchStorages()

	if err != nil {
		if container.dev != nil && container.deviceInfo != nil {
			if strings.Contains(err.Error(), "EOF") {

				// for newer samsung devices we might need to access the storage again in case
				// the fetch storage function returns an 'EOF' error
				if retry {
					// make sure the retry param is false else mtp could go into infinite loop
					_sendFetchStorages(ptr, false)

					return
				} else {
					err = fmt.Errorf("error allow storage access. %+v", err.Error())
				}
			}
		}

		send_to_js.SendError(ptr, err)

		return
	}

	send_to_js.SendStorages(ptr, storages)
}

//export MakeDirectory
func MakeDirectory(ptr int64, json *C.char) {
	i := MakeDirectoryInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(json), &i)
	if err != nil {
		send_to_js.SendError(ptr, fmt.Errorf("error occured while Unmarshalling MakeDirectory input data %+v: ", err))

		return
	}

	if err := _makeDirectory(i.StorageId, i.FullPath); err != nil {
		send_to_js.SendError(ptr, err)

		return
	}

	send_to_js.SendMakeDirectory(ptr)
}

//export FileExists
func FileExists(ptr int64, json *C.char) {
	i := FileExistsInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(json), &i)
	if err != nil {
		send_to_js.SendError(ptr, fmt.Errorf("error occured while Unmarshalling FileExists input data %+v: ", err))

		return
	}

	var fProps []mtpx.FileProp
	for _, f := range i.Files {
		fProp := mtpx.FileProp{FullPath: f}

		fProps = append(fProps, fProp)
	}

	fc, err := _fileExists(i.StorageId, fProps)
	if err != nil {
		send_to_js.SendError(ptr, err)

		return
	}

	send_to_js.SendFileExists(ptr, fc, i.Files)
}

//export DeleteFile
func DeleteFile(ptr int64, json *C.char) {
	i := DeleteFileInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(json), &i)
	if err != nil {
		send_to_js.SendError(ptr, fmt.Errorf("error occured while Unmarshalling DeleteFile input data %+v: ", err))

		return
	}

	var fProps []mtpx.FileProp
	for _, f := range i.Files {
		fProp := mtpx.FileProp{FullPath: f}

		fProps = append(fProps, fProp)
	}

	err = _deleteFile(i.StorageId, fProps)
	if err != nil {
		send_to_js.SendError(ptr, err)

		return
	}

	send_to_js.SendDeleteFile(ptr)
}

//export RenameFile
func RenameFile(ptr int64, json *C.char) {
	i := RenameFileInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(json), &i)
	if err != nil {
		send_to_js.SendError(ptr, fmt.Errorf("error occured while Unmarshalling RenameFile input data %+v: ", err))

		return
	}

	var fProp = mtpx.FileProp{
		FullPath: i.FullPath,
	}

	err = _renameFile(i.StorageId, fProp, i.NewFileName)
	if err != nil {
		send_to_js.SendError(ptr, err)

		return
	}

	send_to_js.SendRenameFile(ptr)
}

//export Walk
func Walk(ptr int64, json *C.char) {
	i := WalkInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(json), &i)
	if err != nil {
		send_to_js.SendError(ptr, fmt.Errorf("error occured while Unmarshalling Walk input data %+v: ", err))

		return
	}

	files, err := _walk(i.StorageId, i.FullPath, i.Recursive, i.SkipDisallowedFiles)
	if err != nil {
		send_to_js.SendError(ptr, err)

		return
	}

	send_to_js.SendWalk(ptr, files)
}

//export UploadFiles
func UploadFiles(onPreprocessPtr, onProgressPtr, onDonePtr int64, json *C.char) {
	i := UploadFilesInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(json), &i)
	if err != nil {
		send_to_js.SendError(onDonePtr, fmt.Errorf("error occured while Unmarshalling UploadFiles input data %+v: ", err))

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
						send_to_js.SendUploadFilesPreprocess(onPreprocessPtr, v.fi, v.fullPath)

					case ProgressContainer:
						send_to_js.SendTransferFilesProgress(onProgressPtr, v.pInfo)

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
		send_to_js.SendError(onDonePtr, err)

		ch <- true

		return
	}

	ch <- true

	send_to_js.SendTransferFilesDone(onDonePtr)
}

//export DownloadFiles
func DownloadFiles(onPreprocessPtr, onProgressPtr, onDonePtr int64, json *C.char) {
	i := DownloadFilesInput{}

	var j = jsoniter.ConfigFastest
	err := j.UnmarshalFromString(C.GoString(json), &i)
	if err != nil {
		send_to_js.SendError(onDonePtr, fmt.Errorf("error occured while Unmarshalling DownloadFiles input data %+v: ", err))

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
						send_to_js.SendDownloadFilesPreprocess(onPreprocessPtr, v.fi)

					case ProgressContainer:
						send_to_js.SendTransferFilesProgress(onProgressPtr, v.pInfo)

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
		send_to_js.SendError(onDonePtr, err)

		ch <- true

		return
	}

	ch <- true

	send_to_js.SendTransferFilesDone(onDonePtr)
}

//export Dispose
func Dispose(ptr int64) {
	if err := _dispose(); err != nil {
		send_to_js.SendError(ptr, err)

		return
	}

	container.dev = nil
	container.deviceInfo = nil

	send_to_js.SendDispose(ptr)
}

func main() {}
