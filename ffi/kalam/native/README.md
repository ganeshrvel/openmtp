Build:

```shell script
sudo install_name_tool -id "@loader_path/libusb.dylib" /usr/local/Cellar/libusb/1.0.23/lib/libusb-1.0.0.dylib

./ffi/kalam/native/scripts/build.sh
```
