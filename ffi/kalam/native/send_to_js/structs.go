package send_to_js

import (
	"github.com/ganeshrvel/go-mtpfs/mtp"
	"github.com/ganeshrvel/go-mtpx"
)

type ErrorType string

type FileInfo struct {
	Size       int64  `json:"size"`
	IsDir      bool   `json:"isFolder"`
	ModTime    string `json:"dateAdded"`
	Name       string `json:"name"`
	FullPath   string `json:"path"`
	ParentPath string `json:"parentPath"`
	Extension  string `json:"extension"`
	ParentId   uint32 `json:"parentId"`
	ObjectId   uint32 `json:"objectId"`
}

type FileExistsData struct {
	Fullpath string `json:"fullpath"`
	Exists   bool   `json:"exists"`
}

type TransferPreprocessData struct {
	FullPath string `json:"fullPath"`
	Name     string `json:"name"`
	Size     int64  `json:"size"`
}

type TransferSizeInfo struct {
	// total size to transfer
	// note: the value will be 0 if pre-processing was not allowed
	Total int64 `json:"total"`

	// total size transferred
	Sent int64 `json:"sent"`

	// progress in percentage
	Progress float32 `json:"progress"`
}

type TransferProgressInfo struct {
	FullPath string `json:"fullPath"`

	Name string `json:"name"`

	ElapsedTime int64 `json:"elapsedTime"`

	// transfer rate (in MB/s)
	Speed float64 `json:"speed"`

	// total files to transfer
	// note: the value will be 0 if pre-processing was not allowed
	TotalFiles int64 `json:"totalFiles"`

	// total directories to transfer
	// note: the value will be 0 if pre-processing was not allowed
	TotalDirectories int64 `json:"totalDirectories"`

	// total files transferred
	FilesSent int64 `json:"filesSent"`

	// total file transfer progress in percentage
	FilesSentProgress float32 `json:"filesSentProgress"`

	// size information of the current file which is being transferred
	ActiveFileSize TransferSizeInfo `json:"activeFileSize"`

	// total size information of the files for the transfer session
	BulkFileSize TransferSizeInfo `json:"bulkFileSize"`

	Status mtpx.TransferStatus `json:"status"`
}

type ErrorResult struct {
	ErrorType ErrorType   `json:"errorType"`
	Error     string      `json:"error"`
	Data      interface{} `json:"data"`
}

type DeviceInfo struct {
	MtpDeviceInfo *mtp.DeviceInfo    `json:"mtpDeviceInfo"`
	UsbDeviceInfo *mtp.UsbDeviceInfo `json:"usbDeviceInfo"`
}

type InitializeResult struct {
	ErrorType ErrorType  `json:"errorType"`
	Error     string     `json:"error"`
	Data      DeviceInfo `json:"data"`
}

type DeviceInfoResult struct {
	ErrorType ErrorType  `json:"errorType"`
	Error     string     `json:"error"`
	Data      DeviceInfo `json:"data"`
}

type StoragesResult struct {
	ErrorType ErrorType          `json:"errorType"`
	Error     string             `json:"error"`
	Data      []mtpx.StorageData `json:"data"`
}

type MakeDirectoryResult struct {
	ErrorType ErrorType `json:"errorType"`
	Error     string    `json:"error"`
	Data      bool      `json:"data"`
}

type FileExistsResult struct {
	ErrorType ErrorType        `json:"errorType"`
	Error     string           `json:"error"`
	Data      []FileExistsData `json:"data"`
}

type DeleteFileResult struct {
	ErrorType ErrorType `json:"errorType"`
	Error     string    `json:"error"`
	Data      bool      `json:"data"`
}

type RenameFileResult struct {
	ErrorType ErrorType `json:"errorType"`
	Error     string    `json:"error"`
	Data      bool      `json:"data"`
}

type WalkResult struct {
	ErrorType ErrorType  `json:"errorType"`
	Error     string     `json:"error"`
	Data      []FileInfo `json:"data"`
}

type UploadFilesPreprocessResult struct {
	ErrorType ErrorType              `json:"errorType"`
	Error     string                 `json:"error"`
	Data      TransferPreprocessData `json:"data"`
}

type UploadFilesProgressResult struct {
	ErrorType ErrorType            `json:"errorType"`
	Error     string               `json:"error"`
	Data      TransferProgressInfo `json:"data"`
}

type DownloadFilesPreprocessResult struct {
	ErrorType ErrorType              `json:"errorType"`
	Error     string                 `json:"error"`
	Data      TransferPreprocessData `json:"data"`
}

type UploadFilesDoneResult struct {
	ErrorType ErrorType `json:"errorType"`
	Error     string    `json:"error"`
	Data      bool      `json:"data"`
}

type DisposeResult struct {
	ErrorType ErrorType `json:"errorType"`
	Error     string    `json:"error"`
	Data      bool      `json:"data"`
}
