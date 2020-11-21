package send_to_js

import (
	"github.com/ganeshrvel/go-mtpfs/mtp"
	"github.com/ganeshrvel/go-mtpx"
)

type ErrorType string

type ErrorResult struct {
	Error    ErrorType   `json:"error"`
	ErrorMsg string      `json:"errorMsg"`
	Data     interface{} `json:"data"`
}

type InitializeResult struct {
	Error    ErrorType      `json:"error"`
	ErrorMsg string         `json:"errorMsg"`
	Data     mtp.DeviceInfo `json:"data"`
}

type DeviceInfoResult struct {
	Error    ErrorType      `json:"error"`
	ErrorMsg string         `json:"errorMsg"`
	Data     mtp.DeviceInfo `json:"data"`
}

type StoragesResult struct {
	Error    ErrorType          `json:"error"`
	ErrorMsg string             `json:"errorMsg"`
	Data     []mtpx.StorageData `json:"data"`
}

type DisposeResult struct {
	Error    ErrorType `json:"error"`
	ErrorMsg string    `json:"errorMsg"`
	Data     bool      `json:"data"`
}

type FileInfo struct {
	Size       int64  `json:"size"`
	IsDir      bool   `json:"isDir"`
	ModTime    string `json:"modTime"`
	Name       string `json:"name"`
	FullPath   string `json:"fullPath"`
	ParentPath string `json:"parentPath"`
	Extension  string `json:"extension"`
	ParentId   uint32 `json:"parentId"`
	ObjectId   uint32 `json:"objectId"`
}
