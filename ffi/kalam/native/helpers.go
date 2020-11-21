package main

import (
	"fmt"
	"github.com/ganeshrvel/go-mtpfs/mtp"
	"github.com/ganeshrvel/go-mtpx"
	"log"
)

func verifyMtpSession(c verifyMtpSessionMode) error {
	if container.dev == nil {
		return fmt.Errorf("no mtp device found")
	}

	if !c.skipDeviceChangeCheck && container.deviceInfo != nil {
		dInfo, err := mtpx.FetchDeviceInfo(container.dev)
		if err != nil {
			container.deviceInfo = nil

			return err
		}

		if container.deviceInfo.SerialNumber != dInfo.SerialNumber {
			container.deviceInfo = dInfo

			return fmt.Errorf("mtp device was removed")
		}
	}

	return nil
}

func _initialize(i mtpx.Init) (*mtp.Device, error) {
	d, err := mtpx.Initialize(i)
	if err != nil {
		return nil, err
	}

	container.dev = d

	return d, nil
}

func _fetchDeviceInfo() (*mtp.DeviceInfo, error) {
	v := verifyMtpSessionMode{skipDeviceChangeCheck: true}

	if !v.skipDeviceChangeCheck {
		log.Panicln("'skipDeviceChangeCheck' should be 'true' in _fetchDeviceInfo.verifyMtpSessionMode")
	}

	if err := verifyMtpSession(v); err != nil {
		return nil, err
	}

	dInfo, err := mtpx.FetchDeviceInfo(container.dev)
	if err != nil {
		container.deviceInfo = nil

		return nil, err
	}

	container.deviceInfo = dInfo

	return dInfo, nil
}

func _fetchStorages() ([]mtpx.StorageData, error) {
	if err := verifyMtpSession(verifyMtpSessionMode{}); err != nil {
		return nil, err
	}

	storages, err := mtpx.FetchStorages(container.dev)
	if err != nil {
		return nil, err
	}

	return storages, nil
}

func _dispose() error {
	v := verifyMtpSessionMode{skipDeviceChangeCheck: true}

	if !v.skipDeviceChangeCheck {
		log.Panicln("'skipDeviceChangeCheck' should be 'true' in _dispose.verifyMtpSessionMode")
	}

	if err := verifyMtpSession(v); err != nil {
		return err
	}

	mtpx.Dispose(container.dev)

	return nil
}
