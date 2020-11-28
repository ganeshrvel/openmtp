Build:

```shell script
sudo install_name_tool -id "@loader_path/libusb.dylib" /usr/local/Cellar/libusb/1.0.23/lib/libusb-1.0.0.dylib

cp /usr/local/Cellar/libusb/1.0.23/lib/libusb-1.0.0.dylib build/mac/bin/libusb.dylib

./ffi/kalam/native/scripts/build.sh                                               
```
