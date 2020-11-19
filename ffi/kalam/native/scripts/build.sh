#!/bin/zsh

(cd ./ffi/kalam/native && CGO_CFLAGS='-Wno-deprecated-declarations' go build -o ../../../build/mac/bin/kalam.dylib -buildmode=c-shared ./*.go)
