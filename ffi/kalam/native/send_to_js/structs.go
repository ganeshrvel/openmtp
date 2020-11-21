package send_to_js

import "github.com/ganeshrvel/go-mtpfs/mtp"

type Error string

type InitializeResult struct {
	Error    Error          `json:"error"`
	ErrorMsg string         `json:"errorMsg"`
	Data     mtp.DeviceInfo `json:"data"`
}

type ErrorResult struct {
	Error    Error       `json:"error"`
	ErrorMsg string      `json:"errorMsg"`
	Data     interface{} `json:"data"`
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
