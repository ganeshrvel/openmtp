package main

import (
	"archive/tar"
	"bufio"
	"bytes"
	"errors"
	"fmt"
	"io"
	"math"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"sync/atomic"
	"time"

	"github.com/ganeshrvel/go-mtpx"
)

// Android always exposes its primary storage as MTP storage 0x00010001, backed by /storage/emulated/0.
// Other storages (SD cards, USB drives) have no reliable path mapping and are downloaded over MTP.
const adbPrimaryStorageId = 0x00010001
const adbPrimaryStorageRoot = "/storage/emulated/0"

// errAdbUnavailable means the download can't go over adb and should fall back to MTP
var errAdbUnavailable = errors.New("adb unavailable")

// adbDownloadFiles downloads [sources] (MTP paths on the primary storage) into [destination] by streaming
// `tar` over `adb shell`, which avoids MTP's per-object round trips entirely.
// It reports progress through the same [progressCb] as the MTP download.
// It returns errAdbUnavailable before anything is written if adb can't be used.
func adbDownloadFiles(storageId uint32, sources []string, destination, mtpSerial string, progressCb mtpx.ProgressCb) error {
	if storageId != adbPrimaryStorageId {
		return fmt.Errorf("%w: storage 0x%x is not the primary storage", errAdbUnavailable, storageId)
	}

	adb, err := findAdb()
	if err != nil {
		return err
	}

	// target the phone that is connected over MTP; Android reports the same serial number to MTP and adb
	adbArgs := []string{}
	if mtpSerial != "" {
		adbArgs = []string{"-s", mtpSerial}
	}

	// fails if the phone isn't authorized for USB debugging, the serial doesn't match, or tar is missing
	if out, err := adbCmd(adb, adbArgs, "command -v tar").CombinedOutput(); err != nil {
		return fmt.Errorf("%w: %v: %s", errAdbUnavailable, err, bytes.TrimSpace(out))
	}

	devicePaths := make([]string, len(sources))
	for i, s := range sources {
		devicePaths[i] = path.Join(adbPrimaryStorageRoot, path.Clean("/"+s))
	}

	p := &adbProgress{
		pInfo: mtpx.ProgressInfo{
			FileInfo:       &mtpx.FileInfo{},
			StartTime:      time.Now(),
			LatestSentTime: time.Now(),
			ActiveFileSize: &mtpx.TransferSizeInfo{},
			BulkFileSize:   &mtpx.TransferSizeInfo{},
			Status:         mtpx.InProgress,
		},
		cb: progressCb,
	}

	// count the totals concurrently, so the copy starts right away and the totals show up within seconds
	go p.countTotals(adb, adbArgs, devicePaths)

	for _, dp := range devicePaths {
		if err := p.extract(adb, adbArgs, dp, destination); err != nil {
			return err
		}
	}

	p.pInfo.Status = mtpx.Completed

	return progressCb(&p.pInfo, nil)
}

// GUI apps don't inherit the shell's PATH, so the usual install locations are checked too
func findAdb() (string, error) {
	if p, err := exec.LookPath("adb"); err == nil {
		return p, nil
	}

	home, _ := os.UserHomeDir()
	for _, p := range []string{
		"/opt/homebrew/bin/adb",
		"/usr/local/bin/adb",
		filepath.Join(home, "Library/Android/sdk/platform-tools/adb"),
	} {
		if _, err := os.Stat(p); err == nil {
			return p, nil
		}
	}

	return "", fmt.Errorf("%w: adb not found", errAdbUnavailable)
}

// adbCmd runs [script] in the device shell. `-T` disables the pty, which keeps binary output intact,
// keeps stderr out of stdout and passes the exit code through.
func adbCmd(adb string, adbArgs []string, script string) *exec.Cmd {
	return exec.Command(adb, append(append(adbArgs[:len(adbArgs):len(adbArgs)], "shell", "-T"), script)...)
}

func shellQuote(s string) string {
	return "'" + strings.ReplaceAll(s, "'", `'\''`) + "'"
}

type adbProgress struct {
	pInfo mtpx.ProgressInfo
	cb    mtpx.ProgressCb

	// written by countTotals, read by the copy loop (atomically)
	totalFiles, totalSize int64
}

func (p *adbProgress) countTotals(adb string, adbArgs []string, devicePaths []string) {
	quoted := make([]string, len(devicePaths))
	for i, dp := range devicePaths {
		quoted[i] = shellQuote(dp)
	}

	out, err := adbCmd(adb, adbArgs, "find "+strings.Join(quoted, " ")+" -type f -exec stat -c %s {} + 2>/dev/null").Output()
	if err != nil && len(out) == 0 {
		// ponytail: without totals the transfer still works, it just shows per-file progress only
		return
	}

	var files, size int64
	sc := bufio.NewScanner(bytes.NewReader(out))
	for sc.Scan() {
		if n, err := strconv.ParseInt(strings.TrimSpace(sc.Text()), 10, 64); err == nil {
			files++
			size += n
		}
	}

	atomic.StoreInt64(&p.totalFiles, files)
	atomic.StoreInt64(&p.totalSize, size)
}

// extract streams [devicePath] (a file or a directory) into [destination]/<basename of devicePath>
func (p *adbProgress) extract(adb string, adbArgs []string, devicePath, destination string) error {
	parent, base := path.Split(devicePath)
	cmd := adbCmd(adb, adbArgs, "tar -cf - -C "+shellQuote(parent)+" "+shellQuote(base))

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("adb: %w", err)
	}

	err = p.untar(tar.NewReader(stdout), destination)
	if err != nil {
		_ = cmd.Process.Kill()
	}

	if waitErr := cmd.Wait(); err == nil && waitErr != nil {
		err = fmt.Errorf("adb tar %s: %v: %s", devicePath, waitErr, bytes.TrimSpace(stderr.Bytes()))
	}

	return err
}

func (p *adbProgress) untar(tr *tar.Reader, destination string) error {
	root := filepath.Clean(destination)

	for {
		hdr, err := tr.Next()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return fmt.Errorf("reading the adb tar stream: %w", err)
		}

		// never write outside of [destination], whatever the device sends
		target := filepath.Join(root, filepath.FromSlash(hdr.Name))
		if !strings.HasPrefix(target, root+string(os.PathSeparator)) {
			return fmt.Errorf("refusing to extract %q outside of %q", hdr.Name, destination)
		}

		switch hdr.Typeflag {
		case tar.TypeDir:
			if err := os.MkdirAll(target, 0o755); err != nil {
				return err
			}

		case tar.TypeReg:
			if err := p.writeFile(tr, hdr, target); err != nil {
				return err
			}

		default:
			// symlinks, devices etc. aren't downloaded over MTP either
		}
	}
}

func (p *adbProgress) writeFile(r io.Reader, hdr *tar.Header, target string) error {
	if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
		return err
	}

	f, err := os.Create(target)
	if err != nil {
		return err
	}

	p.pInfo.FileInfo = &mtpx.FileInfo{
		Size:     hdr.Size,
		ModTime:  hdr.ModTime,
		Name:     path.Base(hdr.Name),
		FullPath: "/" + hdr.Name,
	}
	p.pInfo.ActiveFileSize.Total = hdr.Size
	p.pInfo.ActiveFileSize.Sent = 0

	_, err = io.Copy(f, io.TeeReader(r, progressWriter(p.onChunk)))
	if closeErr := f.Close(); err == nil {
		err = closeErr
	}
	if err != nil {
		return err
	}

	p.pInfo.FilesSent++
	if err := p.onChunk(0); err != nil {
		return err
	}

	return os.Chtimes(target, hdr.ModTime, hdr.ModTime)
}

// an error returned by the progress callback aborts the transfer, like it does for MTP
func (p *adbProgress) onChunk(n int) error {
	pi := &p.pInfo
	now := time.Now()

	pi.ActiveFileSize.Sent += int64(n)
	pi.ActiveFileSize.Progress = mtpx.Percent(float32(pi.ActiveFileSize.Sent), float32(pi.ActiveFileSize.Total))
	pi.BulkFileSize.Sent += int64(n)

	// 0 while the totals are still being counted (or if counting failed): the UI then shows 0% rather than a
	// wrong value. Clamped, in case files were added on the phone after counting.
	if totalSize := atomic.LoadInt64(&p.totalSize); totalSize > 0 {
		pi.TotalFiles = maxInt64(atomic.LoadInt64(&p.totalFiles), pi.FilesSent)
		pi.BulkFileSize.Total = maxInt64(totalSize, pi.BulkFileSize.Sent)
	}
	pi.FilesSentProgress = mtpx.Percent(float32(pi.FilesSent), float32(pi.TotalFiles))
	pi.BulkFileSize.Progress = mtpx.Percent(float32(pi.BulkFileSize.Sent), float32(pi.BulkFileSize.Total))

	// average speed since the start in MB/s, like the MTP download reports it
	if elapsed := now.Sub(pi.StartTime).Seconds(); elapsed > 0 {
		pi.Speed = math.Round(float64(pi.BulkFileSize.Sent)/elapsed/1e6*100) / 100
	}
	pi.LatestSentTime = now

	return p.cb(pi, nil)
}

type progressWriter func(n int) error

func (w progressWriter) Write(b []byte) (int, error) {
	if err := w(len(b)); err != nil {
		return 0, err
	}

	return len(b), nil
}

func maxInt64(a, b int64) int64 {
	if a > b {
		return a
	}

	return b
}
