package send_to_js

import (
	"fmt"
	"github.com/ganeshrvel/go-mtpfs/mtp"
	"github.com/ganeshrvel/go-mtpx"
	jsoniter "github.com/json-iterator/go"
	"strings"
)

// process errors
func processError(e error) (errorType ErrorType, errorMsg string) {
	switch v := e.(type) {
	case mtp.RCError:
		if v == 0x2009 {
			errorType = ErrorStorageFull
			errorMsg = v.Error()
		}

	case mtpx.MtpDetectFailedError:
		errorType = ErrorMtpDetectFailed
		errorMsg = v.Error()

	case mtpx.ConfigureError:
		errorType = ErrorDeviceSetup
		errorMsg = v.Error()

	case mtpx.DeviceInfoError:
		errorType = ErrorDeviceInfo
		errorMsg = v.Error()

	case mtpx.StorageInfoError:
		errorType = ErrorStorageInfo
		errorMsg = v.Error()

	case mtpx.NoStorageError:
		errorType = ErrorNoStorage
		errorMsg = v.Error()

	case mtpx.ListDirectoryError:
		errorType = ErrorListDirectory
		errorMsg = v.Error()

	case mtpx.FileNotFoundError:
		errorType = ErrorFileNotFound
		errorMsg = v.Error()

	case mtpx.FilePermissionError:
		errorType = ErrorFilePermission
		errorMsg = v.Error()

	case mtpx.LocalFileError:
		errorType = ErrorLocalFileRead
		errorMsg = v.Error()

	case mtpx.InvalidPathError:
		errorType = ErrorInvalidPath
		errorMsg = v.Error()

	case mtpx.FileTransferError:
		errorType = ErrorFileTransfer
		errorMsg = v.Error()

	case mtpx.FileObjectError:
		errorType = ErrorFileObjectRead
		errorMsg = v.Error()

	case mtpx.SendObjectError:
		errorType = ErrorSendObject
		errorMsg = v.Error()

	}

	// this is a fallthrough case while processing errors
	if errorType == "" {
		if strings.Contains(e.Error(), "no mtp device found") {
			errorType = ErrorMtpDetectFailed
			errorMsg = e.Error()
		} else if strings.Contains(e.Error(), "mtp device was removed") {
			errorType = ErrorMtpChanged
			errorMsg = e.Error()
		} else {
			// Mark an error as general error as a fallthrough
			errorType = ErrorGeneral
			errorMsg = e.Error()
		}
	}

	// handle special cases of error
	if strings.Contains(errorMsg, "allow storage access") {
		errorType = ErrorAllowStorageAccess
		errorMsg = e.Error()
	} else if strings.Contains(errorMsg, "device is not open") {
		errorType = ErrorDeviceLocked
		errorMsg = e.Error()
	} else if strings.Contains(errorMsg, "LIBUSB_ERROR_NO_DEVICE") {
		errorType = ErrorMtpDetectFailed
		errorMsg = e.Error()
	} else if strings.Contains(errorMsg, "more than 1 device") {
		errorType = ErrorMultipleDevice
		errorMsg = e.Error()
	} else if strings.Contains(errorMsg, "StoreFull") {
		errorType = ErrorStorageFull
		errorMsg = e.Error()
	} else if strings.Contains(errorMsg, "StoreNotAvailable") {
		errorType = ErrorNoStorage
		errorMsg = e.Error()
	}

	return errorType, errorMsg
}

// convert struct to json which will be sent to JS function
func toJson(o interface{}) string {
	var json = jsoniter.ConfigFastest
	w, err := json.Marshal(&o)
	if err != nil {
		fmt.Printf("error occured in SendError.json.Marshal %+v: ", err)

		return ""
	}

	return string(w)
}
