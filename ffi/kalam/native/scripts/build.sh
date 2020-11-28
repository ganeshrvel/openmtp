#!/bin/zsh

echo "searching for libusb installation..."
if brew info libusb | grep "Not installed" >/dev/null 2>&1; then
  echo "libusb is not installed"
  echo "run: brew install libusb"

  exit 1
fi

libusbPath=$(brew ls libusb | grep "libusb-1.0.0.dylib")
echo "found libusb in $libusbPath"

echo ""
echo "verifying @loader_path..."
if ! otool -l "$libusbPath" | grep "@loader_path/libusb.dylib" >/dev/null 2>&1; then
  echo "incorrect @loader_path"
  echo "run: sudo install_name_tool -id \"@loader_path/libusb.dylib\" $libusbPath"

  exit 1
fi
echo "verified libusb @loader_path"
echo ""

echo "building kalam..."

(cd ./ffi/kalam/native && CGO_CFLAGS='-Wno-deprecated-declarations' \
  go build -gcflags=-trimpath=$(go env GOPATH) -asmflags=-trimpath=$(go env GOPATH) \
  -o ../../../build/mac/bin/kalam.dylib -buildmode=c-shared ./*.go)
