package send_to_js

/*
	#include "stdio.h"
	#include "stdlib.h"
	#include "stdbool.h"

 	typedef void (* cb_result_t)(char*);
	void send_result(int64_t ptr, char* json) {
		cb_result_t cb = (cb_result_t) ptr;

		cb(json);
	}

 	typedef void (* cb_upload_files_t)(char*, double);
	void send_upload_files_result(int64_t ptr, char* name, double speed) {
		cb_upload_files_t cb = (cb_upload_files_t) ptr;

		cb(name, speed);
	}
*/
import "C"
import (
	"github.com/ganeshrvel/go-mtpfs/mtp"
	"github.com/ganeshrvel/go-mtpx"
	"os"
	"time"
)

func SendError(ptr int64, err error) {
	errorType, errorMsg := processError(err)

	o := ErrorResult{
		ErrorType: errorType,
		Error:     errorMsg,
		Data:      nil,
	}

	json := toJson(o)

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendInitialize(ptr int64, deviceInfo *mtp.DeviceInfo) {
	o := InitializeResult{
		Data: *deviceInfo,
	}

	json := toJson(o)

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendDeviceInfo(ptr int64, deviceInfo *mtp.DeviceInfo) {
	o := DeviceInfoResult{
		Data: *deviceInfo,
	}

	json := toJson(o)

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendStorages(ptr int64, storages []mtpx.StorageData) {
	o := StoragesResult{
		Data: storages,
	}

	json := toJson(o)

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendMakeDirectory(ptr int64) {
	o := MakeDirectoryResult{
		Data: true,
	}

	json := toJson(o)

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendFileExists(ptr int64, fc []mtpx.FileExistsContainer, inputFiles []string) {
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

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendDeleteFile(ptr int64) {
	o := DeleteFileResult{
		Data: true,
	}

	json := toJson(o)

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendRenameFile(ptr int64) {
	o := RenameFileResult{
		Data: true,
	}

	json := toJson(o)

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendWalk(ptr int64, files []*mtpx.FileInfo) {
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

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendUploadFilesPreProcess(ptr int64, fi *os.FileInfo, fullPath string) {
	o := UploadFilesPreProcessResult{
		Data: TransferPreProcessData{
			FullPath: fullPath,
			Name:     (*fi).Name(),
			Size:     (*fi).Size(),
		},
	}

	json := toJson(o)

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendUploadFilesProgress(ptr int64, p *mtpx.ProgressInfo, ) {
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

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendUploadFilesDone(ptr int64) {
	o := UploadFilesDoneResult{
		Data: true,
	}

	json := toJson(o)

	C.send_result(C.int64_t(ptr), C.CString(json))
}

func SendDispose(ptr int64) {
	o := DisposeResult{
		Data: true,
	}

	json := toJson(o)

	C.send_result(C.int64_t(ptr), C.CString(json))
}
