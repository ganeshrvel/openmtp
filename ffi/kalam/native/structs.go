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
