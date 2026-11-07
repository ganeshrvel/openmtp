package main

import (
	"archive/tar"
	"bytes"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/ganeshrvel/go-mtpx"
)

func TestAdbUntar(t *testing.T) {
	mkTar := func(entries ...*tar.Header) *tar.Reader {
		var b bytes.Buffer
		w := tar.NewWriter(&b)
		for _, h := range entries {
			_ = w.WriteHeader(h)
			if h.Typeflag == tar.TypeReg {
				_, _ = w.Write(bytes.Repeat([]byte("x"), int(h.Size)))
			}
		}
		_ = w.Close()

		return tar.NewReader(&b)
	}
	newProgress := func(calls *int) *adbProgress {
		return &adbProgress{
			pInfo: mtpx.ProgressInfo{StartTime: time.Now(), ActiveFileSize: &mtpx.TransferSizeInfo{}, BulkFileSize: &mtpx.TransferSizeInfo{}},
			cb:    func(*mtpx.ProgressInfo, error) error { *calls++; return nil },
		}
	}

	dest := t.TempDir()
	mtime := time.Date(2024, 5, 1, 10, 0, 0, 0, time.UTC)
	calls := 0
	p := newProgress(&calls)

	err := p.untar(mkTar(
		&tar.Header{Name: "Camera/", Typeflag: tar.TypeDir, Mode: 0o755},
		&tar.Header{Name: "Camera/a b.jpg", Typeflag: tar.TypeReg, Size: 1000, Mode: 0o644, ModTime: mtime},
		&tar.Header{Name: "Camera/link", Typeflag: tar.TypeSymlink, Linkname: "/etc/passwd"},
	), dest)
	if err != nil {
		t.Fatal(err)
	}

	st, err := os.Stat(filepath.Join(dest, "Camera", "a b.jpg"))
	if err != nil || st.Size() != 1000 || !st.ModTime().Equal(mtime) {
		t.Fatalf("extracted file: %v %+v", err, st)
	}
	if _, err := os.Lstat(filepath.Join(dest, "Camera", "link")); !os.IsNotExist(err) {
		t.Fatal("symlink should not be extracted")
	}
	// totals not counted yet: overall progress must read 0%, not a made-up value
	if p.pInfo.FilesSent != 1 || p.pInfo.BulkFileSize.Sent != 1000 || p.pInfo.BulkFileSize.Progress != 0 || calls == 0 {
		t.Fatalf("progress: %+v %+v, %d calls", p.pInfo, p.pInfo.BulkFileSize, calls)
	}

	// totals counted
	p.totalFiles, p.totalSize = 1, 1000
	_ = p.onChunk(0)
	if p.pInfo.TotalFiles != 1 || p.pInfo.BulkFileSize.Total != 1000 || p.pInfo.BulkFileSize.Progress != 100 {
		t.Fatalf("progress with totals: %+v %+v", p.pInfo, p.pInfo.BulkFileSize)
	}

	err = newProgress(&calls).untar(mkTar(&tar.Header{Name: "../evil", Typeflag: tar.TypeReg, Size: 1}), dest)
	if err == nil {
		t.Fatal("path traversal should be refused")
	}
	if _, err := os.Stat(filepath.Join(filepath.Dir(dest), "evil")); !os.IsNotExist(err) {
		t.Fatal("file written outside of destination")
	}

	if got, want := shellQuote("it's DCIM"), `'it'\''s DCIM'`; got != want {
		t.Fatalf("shellQuote: got %s want %s", got, want)
	}
}
