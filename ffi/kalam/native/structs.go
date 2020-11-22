package main

import "github.com/ganeshrvel/go-mtpfs/mtp"

type verifyMtpSessionMode struct {
	skipDeviceChangeCheck bool
}

type deviceContainer struct {
	dev        *mtp.Device
	deviceInfo *mtp.DeviceInfo
}

type MakeDirectoryInput struct {
	StorageId uint32 `json:"storageId"`
	FullPath  string `json:"fullPath"`
}

type FileExistsInput struct {
	StorageId uint32   `json:"storageId"`
	Files     []string `json:"Files"`
}

type DeleteFileInput struct {
	StorageId uint32   `json:"storageId"`
	Files     []string `json:"Files"`
}

type RenameFileInput struct {
	StorageId   uint32 `json:"storageId"`
	FullPath    string `json:"fullPath"`
	NewFileName string `json:"newFileName"`
}

type WalkInput struct {
	StorageId           uint32 `json:"storageId"`
	FullPath            string `json:"fullPath"`
	Recursive           bool   `json:"recursive"`
	SkipDisallowedFiles bool   `json:"skipDisallowedFiles"`
}

type UploadFilesInput struct {
	StorageId       uint32   `json:"storageId"`
	Sources         []string `json:"sources"`
	Destination     string   `json:"destination"`
	PreprocessFiles bool     `json:"preprocessFiles"`
}
