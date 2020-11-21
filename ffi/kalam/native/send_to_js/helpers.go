package send_to_js

import (
	"fmt"
	"github.com/ganeshrvel/go-mtpx"
	jsoniter "github.com/json-iterator/go"
	"strings"
)

// process errors
func processError(e error) (errorType ErrorType, errorMsg string) {
	switch v := e.(type) {
	case mtpx.MtpDetectFailedError:
		errorType = ErrorMtpDetectFailed
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
		}
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
