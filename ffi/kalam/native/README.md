```shell script
xcode-select --install
brew install llvm
nano ~/.zshrc
```

Add these line to the ~/.zshrc file

```shell
export PATH="/opt/homebrew/opt/llvm/bin:$PATH"
export LDFLAGS="-L/opt/homebrew/opt/llvm/lib"
export CPPFLAGS="-I/opt/homebrew/opt/llvm/include"
```

```shell
source ~/.zshrc
```

```shell script
go get
```


**Troubleshooting**
- If you keep getting `fatal error: 'stdlib.h' file not found xcode`, then:
- Add these line to the ~/.zshrc file (`nano ~/.zshrc`)

```shell
export SDKROOT=$(xcrun --sdk macosx --show-sdk-path)
```

```shell
source ~/.zshrc
```

Build:

```shell
brew install libusb
brew info libusb
```

- Copy the path in the terminal; eg: `/opt/homebrew/Cellar/libusb/1.0.25`

```shell script
sudo install_name_tool -id "@loader_path/libusb.dylib" <libusb-path>/lib/libusb-1.0.0.dylib

# eg: sudo install_name_tool -id "@loader_path/libusb.dylib" /opt/homebrew/Cellar/libusb/1.0.25/lib/libusb-1.0.0.dylib

cp /opt/homebrew/Cellar/libusb/1.0.25/lib/libusb-1.0.dylib  ./build/mac/bin/libusb.dylib
```

```shell
./ffi/kalam/native/scripts/build.sh
```


- remove libusb `brew remove libusb`
- Download the required version of the libusb using `Brew download for another OS version` (ref)
- Copy the `/Users/ganeshr/Desktop/arm64_big_sur/1.0.25/lib/libusb-1.0.0.dylib` to the `build/mac/bin/libusb.dylib`
- Make a backup copy of `/Users/ganeshr/Desktop/arm64_big_sur/1.0.25/lib/libusb-1.0.0.dylib`
- change the `rpath` using: `install_name_tool -add_rpath @loader_path/libusb.dylib /Users/ganeshr/Desktop/arm64_big_sur/1.0.25/lib/libusb-1.0.0.dylib`
- Open `/Users/ganeshr/Desktop/arm64_big_sur/1.0.25/lib/pkgconfig/libusb-1.0.pc`
    - edit `prefix` as `prefix=/Users/ganeshr/Desktop/amd64_mojave/1.0.24`
    - Save it
- Run this command to:
```shell
(  
        cd ./ffi/kalam/native && CGO_ENABLED=1 \
        PKG_CONFIG_PATH='/Users/ganeshr/Desktop/arm64_big_sur/1.0.25/lib/pkgconfig' \
        CGO_CFLAGS='-Wno-deprecated-declarations' \
        GOARCH=arm64 GOOS=darwin \
        go build \
        -v -a -trimpath \
        -o ../../../build/mac/bin/kalam.dylib -buildmode=c-shared ./*.go
    )
```
