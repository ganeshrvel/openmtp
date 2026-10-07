#!/usr/bin/env bash
# Builds build/mac/bin/mtp-cli (the Legacy MTP mode helper) as a universal arm64 + x86_64 binary
# from android-file-transfer-linux. Needs the Xcode command line tools and cmake.
set -euo pipefail

AFT_VERSION="${AFT_VERSION:-v4.5}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

curl -sSL "https://github.com/whoozle/android-file-transfer-linux/archive/refs/tags/${AFT_VERSION}.tar.gz" \
  | tar -xz -C "$WORK"
SRC="$(find "$WORK" -maxdepth 1 -type d -name 'android-file-transfer-linux-*')"

# CMAKE_IGNORE_PREFIX_PATH keeps Homebrew's readline out so the binary only links system libraries.
cmake -S "$SRC" -B "$WORK/build" \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_OSX_ARCHITECTURES="arm64;x86_64" \
  -DCMAKE_OSX_DEPLOYMENT_TARGET=10.14 \
  -DCMAKE_IGNORE_PREFIX_PATH="/opt/homebrew;/usr/local" \
  -DBUILD_QT_UI=OFF \
  -DBUILD_FUSE=OFF \
  -DBUILD_MTPZ=OFF \
  -DBUILD_PYTHON=OFF \
  -DBUILD_TAGLIB=OFF \
  -DBUILD_SHARED_LIB=OFF
cmake --build "$WORK/build" --target aft-mtp-cli -j"$(sysctl -n hw.ncpu)"

install -m 755 "$WORK/build/cli/aft-mtp-cli" "$ROOT/build/mac/bin/mtp-cli"
file "$ROOT/build/mac/bin/mtp-cli"
otool -L "$ROOT/build/mac/bin/mtp-cli"
