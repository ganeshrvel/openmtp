'use strict';

module.exports.MTP_ERROR_FLAGS = {
  NO_MTP: `No MTP device found`,
  NO_STORAGE: `MTP storage not accessible`,
  LOCAL_FOLDER_NOT_FOUND: `Source folder not found`,
  ILLEGAL_FILE_NAME: `Illegal file name`,
  RENAME_FAILED: `Some error occured while renaming`,
  FILE_INFO_FAILED: `Some error occured while fetching the file information`,
  DOWNLOAD_FILE_FAILED: `Some error occured while transfering files from MTP device`,
  UPLOAD_FILE_FAILED: `Some error occured while transfering files to MTP device`,
  NO_FILES_COPIED: `No files were transfering. Refresh your MTP`,
  CREATE_FOLDER_FAILED: `Some error occured while creating a new folder`,
  CREATE_FOLDER_FILE_FAILED: `A file with a similar name exists`,
  INVALID_PATH_RESOLVE: `Illegal path, could not resolve the path`,
  INVALID_NOT_FOUND: `Path not found`,
  NO_FILES_SELECTED: `No files selected`,
  INVALID_PATH: `Invalid path`
};
