package send_to_js

/*
	#include "stdio.h"
	#include "stdlib.h"
	#include "stdbool.h"

	typedef void (* on_cb_result_t)(char*);
	void send_cb_result(on_cb_result_t* ptr, char* json) {
		on_cb_result_t cb = (on_cb_result_t) ptr;

		if(cb != 0 && cb != NULL){
			cb(json);
		}
	}
*/
import "C"
import (
	"github.com/ganeshrvel/go-mtpfs/mtp"
	"github.com/ganeshrvel/go-mtpx"
	"os"
	"time"
)

type SendCbResult C.on_cb_result_t

func SendError(onDonePtr *SendCbResult, err error) {
	errorType, errorMsg := processError(err)

	o := ErrorResult{
		ErrorType: errorType,
		Error:     errorMsg,
		Data:      nil,
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendInitialize(onDonePtr *SendCbResult, deviceInfo *mtp.DeviceInfo, usbDesc *mtp.UsbDeviceInfo) {
	o := InitializeResult{
		Data: DeviceInfo{
			MtpDeviceInfo: deviceInfo,
			UsbDeviceInfo: usbDesc,
		},
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendDeviceInfo(onDonePtr *SendCbResult, deviceInfo *mtp.DeviceInfo, usbDesc *mtp.UsbDeviceInfo) {
	o := DeviceInfoResult{
		Data: DeviceInfo{
			MtpDeviceInfo: deviceInfo,
			UsbDeviceInfo: usbDesc,
		},
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendStorages(onDonePtr *SendCbResult, storages []mtpx.StorageData) {
	o := StoragesResult{
		Data: storages,
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendMakeDirectory(onDonePtr *SendCbResult) {
	o := MakeDirectoryResult{
		Data: true,
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendFileExists(onDonePtr *SendCbResult, fc []mtpx.FileExistsContainer, inputFiles []string) {
	var fdSlice []FileExistsData
	for i, f := range fc {
		fd := FileExistsData{
			Fullpath: inputFiles[i],
			Exists:   f.Exists,
		}

		fdSlice = append(fdSlice, fd)
	}

	o := FileExistsResult{
		Data: fdSlice,
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendDeleteFile(onDonePtr *SendCbResult) {
	o := DeleteFileResult{
		Data: true,
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendRenameFile(onDonePtr *SendCbResult) {
	o := RenameFileResult{
		Data: true,
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendWalk(onDonePtr *SendCbResult, files []*mtpx.FileInfo) {
	var outputFiles []FileInfo

	for _, f := range files {
		outputFile := FileInfo{
			Size:       f.Size,
			IsDir:      f.IsDir,
			ModTime:    f.ModTime.Format(DateTimeFormat),
			Name:       f.Name,
			FullPath:   f.FullPath,
			ParentPath: f.ParentPath,
			Extension:  f.Extension,
			ParentId:   f.ParentId,
			ObjectId:   f.ObjectId,
		}

		outputFiles = append(outputFiles, outputFile)
	}

	o := WalkResult{
		Data: outputFiles,
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendUploadFilesPreprocess(onDonePtr *SendCbResult, fi *os.FileInfo, fullPath string) {
	o := UploadFilesPreprocessResult{
		Data: TransferPreprocessData{
			FullPath: fullPath,
			Name:     (*fi).Name(),
			Size:     (*fi).Size(),
		},
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendDownloadFilesPreprocess(onDonePtr *SendCbResult, fi *mtpx.FileInfo) {
	o := DownloadFilesPreprocessResult{
		Data: TransferPreprocessData{
			FullPath: fi.FullPath,
			Name:     fi.Name,
			Size:     fi.Size,
		},
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendTransferFilesProgress(onDonePtr *SendCbResult, p *mtpx.ProgressInfo) {
	o := UploadFilesProgressResult{
		Data: TransferProgressInfo{
			FullPath:          p.FileInfo.FullPath,
			Name:              p.FileInfo.Name,
			ElapsedTime:       time.Since(p.StartTime).Milliseconds(),
			Speed:             p.Speed,
			TotalFiles:        p.TotalFiles,
			TotalDirectories:  p.TotalDirectories,
			FilesSent:         p.FilesSent,
			FilesSentProgress: p.FilesSentProgress,
			ActiveFileSize: TransferSizeInfo{
				Total:    p.ActiveFileSize.Total,
				Sent:     p.ActiveFileSize.Sent,
				Progress: p.ActiveFileSize.Progress,
			},
			BulkFileSize: TransferSizeInfo{
				Total:    p.BulkFileSize.Total,
				Sent:     p.BulkFileSize.Sent,
				Progress: p.BulkFileSize.Progress,
			},
			Status: p.Status,
		},
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendTransferFilesDone(onDonePtr *SendCbResult) {
	o := UploadFilesDoneResult{
		Data: true,
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}

func SendDispose(onDonePtr *SendCbResult) {
	o := DisposeResult{
		Data: true,
	}

	json := toJson(o)

	convertedDoneCbPtr := (*C.on_cb_result_t)(onDonePtr)
	C.send_cb_result(convertedDoneCbPtr, C.CString(json))
}
