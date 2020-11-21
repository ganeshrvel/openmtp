package send_to_js

import (
	"fmt"
	"github.com/ganeshrvel/go-mtpx"
	jsoniter "github.com/json-iterator/go"
)

func processError(e error) (err Error, errorMsg string) {
	switch v := e.(type) {
	case mtpx.MtpDetectFailedError:
		err = ErrorMtpDetectFailed
		errorMsg = v.Error()
	}

	return err, errorMsg
}

func toJson(o interface{}) string {
	var json = jsoniter.ConfigFastest
	w, err := json.Marshal(&o)
	if err != nil {
		fmt.Printf("error occured in SendError.json.Marshal %+v: ", err)

		return ""
	}

	return string(w)
}
