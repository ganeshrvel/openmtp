package main

import (
	"fmt"
	"github.com/ganeshrvel/go-mtpfs/mtp"
	"github.com/ganeshrvel/go-mtpx"
	"github.com/ganeshrvel/kalam-mtp-kernel/send_to_js"
	"log"
)

func verifyMtpSession(c verifyMtpSessionMode) error {
	if container.dev == nil {
		return send_to_js.MtpDetectFailedError{Error: fmt.Errorf("no mtp found")}
	}

	if !c.skipDeviceChangeCheck && container.deviceInfo != nil {
		dInfo, err := mtpx.FetchDeviceInfo(container.dev)
		if err != nil {
			container.deviceInfo = nil

			return err
		}

		if container.deviceInfo != dInfo {
			container.deviceInfo = dInfo

			return send_to_js.MtpChangedError{Error: fmt.Errorf("mtp device was changed")}
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
