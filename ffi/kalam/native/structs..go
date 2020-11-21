package main

import "github.com/ganeshrvel/go-mtpfs/mtp"

type verifyMtpSessionMode struct {
	skipDeviceChangeCheck bool
}

type deviceContainer struct {
	dev        *mtp.Device
	deviceInfo *mtp.DeviceInfo
}
