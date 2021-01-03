#!/bin/zsh

echo "searching for libusb installation..."
if brew info libusb | grep "Not installed" >/dev/null 2>&1; then
  echo "libusb is not installed"
  echo "run: brew install libusb"

  exit 1
fi

libusbPath=$(brew ls libusb | grep "libusb-1.0.0.dylib")
echo "found libusb in $libusbPath"

printf "\n"
echo "verifying @loader_path..."
if ! otool -l "$libusbPath" | grep "@loader_path/libusb.dylib" >/dev/null 2>&1; then
  echo "incorrect @loader_path"
  echo "run: sudo install_name_tool -id \"@loader_path/libusb.dylib\" $libusbPath"

  exit 1
fi
echo "verified libusb @loader_path"
printf "\n"

echo "building kalam.dylib..."
printf "\n"
(
  cd ./ffi/kalam/native && CGO_CFLAGS='-Wno-deprecated-declarations' \
    go build \
    -v -a -trimpath \
    -o ../../../build/mac/bin/kalam.dylib -buildmode=c-shared ./*.go
)

printf "\n\n\n"
echo "building kalam_debug_report..."
printf "\n\n"
(
  cd ./ffi/kalam/native && CGO_CFLAGS='-Wno-deprecated-declarations' \
    go build \
    -v -a -trimpath \
    -o ../../../build/mac/bin/kalam_debug_report kalam_debug_report/*.go
)
