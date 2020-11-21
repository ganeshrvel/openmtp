package send_to_js

type MtpDetectFailedError struct {
	error

	Error error
}

type MtpChangedError struct {
	error

	Error error
}
