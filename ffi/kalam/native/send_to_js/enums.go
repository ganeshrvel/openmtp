package send_to_js

const (
	ErrorMtpDetectFailed    ErrorType = "ErrorMtpDetectFailed"
	ErrorMtpChanged         ErrorType = "ErrorMtpChanged"
	ErrorDeviceSetup        ErrorType = "ErrorDeviceSetup"
	ErrorMultipleDevice     ErrorType = "ErrorMultipleDevice"
	ErrorAllowStorageAccess ErrorType = "ErrorAllowStorageAccess"
	ErrorDeviceLocked       ErrorType = "ErrorDeviceLocked"
	ErrorDeviceInfo         ErrorType = "ErrorDeviceInfo"
	ErrorStorageInfo        ErrorType = "ErrorStorageInfo"
	ErrorNoStorage          ErrorType = "ErrorNoStorage"
	ErrorStorageFull        ErrorType = "ErrorStorageFull"
	ErrorListDirectory      ErrorType = "ErrorListDirectory"
	ErrorFileNotFound       ErrorType = "ErrorFileNotFound"
	ErrorFilePermission     ErrorType = "ErrorFilePermission"
	ErrorLocalFileRead      ErrorType = "ErrorLocalFileRead"
	ErrorInvalidPath        ErrorType = "ErrorInvalidPath"
	ErrorFileTransfer       ErrorType = "ErrorFileTransfer"
	ErrorFileObjectRead     ErrorType = "ErrorFileObjectRead"
	ErrorSendObject         ErrorType = "ErrorSendObject"
	ErrorGeneral            ErrorType = "ErrorGeneral"
)
