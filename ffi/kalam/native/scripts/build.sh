#!/bin/zsh

(cd ./ffi/kalam/native && CGO_CFLAGS='-Wno-deprecated-declarations' \
  go build -gcflags=-trimpath=$(go env GOPATH) -asmflags=-trimpath=$(go env GOPATH) \
  -o ../../../build/mac/bin/kalam.dylib -buildmode=c-shared ./*.go)
