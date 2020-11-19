package decode_native

/*
	#include "stdlib.h"
	#include "stdbool.h"

 	typedef void (* cb_upload_files_t)(char*, double);
	void send_upload_files_result(int64_t ptr, char* name, double speed) {
		cb_upload_files_t cb = (cb_upload_files_t) ptr;

		cb(name, speed);
	}

 	typedef void (* cb_walk_result_t)(char*);
	void send_file_info_result(int64_t ptr, char* json) {
		cb_walk_result_t cb = (cb_walk_result_t) ptr;

		cb(json);
	}

*/
import "C"
import (
	"github.com/ganeshrvel/go-mtpx"
)

func UploadFilesCb(ptr int64, fi *mtpx.ProgressInfo) {
	C.send_upload_files_result(C.int64_t(ptr), C.CString(fi.FileInfo.Name), C.double(fi.Speed))
}

type FileInfo struct {
	Size       int64  `json:"Size"`
	IsDir      bool   `json:"IsDir"`
	ModTime    string `json:"ModTime"`
	Name       string `json:"Name"`
	FullPath   string `json:"FullPath"`
	ParentPath string `json:"ParentPath"`
	Extension  string `json:"Extension"`
	ParentId   uint32 `json:"ParentId"`
	ObjectId   uint32 `json:"ObjectId"`
}

//// List the file list
//func SendWalkResult(ptr int64, device *mtp.Device, storageId uint32, fullPath string) {
//	var fList []FileInfo
//
//	_, _, _ = mtpx.Walk(device, storageId, fullPath, false, false, func(objectId uint32, fi *mtpx.FileInfo, err error) error {
//		f := FileInfo{
//			Size:       fi.Size,
//			IsDir:      fi.IsDir,
//			ModTime:    fi.ModTime.Format(DateTimeFormat),
//			Name:       fi.Name,
//			FullPath:   fi.FullPath,
//			ParentPath: fi.ParentPath,
//			Extension:  fi.Extension,
//			ParentId:   fi.ParentId,
//			ObjectId:   fi.ObjectId,
//		}
//
//		fList = append(fList, f)
//
//		return nil
//	})
//
//	start := time.Now()
//	var json = jsoniter.ConfigFastest
//	w, err := json.Marshal(&fList)
//	if err != nil {
//		return err
//	}
//
//	pretty.Println("Native elapsed: ", time.Since(start).Microseconds())
//	pretty.Println("fList length: ", len(fList))
//
//	C.send_file_info_result(C.int64_t(ptr), C.CString(string(w)))
//}
