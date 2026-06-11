import path from 'path';
import { resolveKalamLibPath } from '../resolveLibPath';

describe('resolveKalamLibPath', () => {
  it('resolves the arm64 dylib path under a given repo root', () => {
    const p = resolveKalamLibPath({
      repoRoot: '/repo',
      arch: 'arm64',
      platform: 'darwin',
    });

    expect(p).toBe(path.resolve('/repo/build/mac/bin/arm64/kalam.dylib'));
  });

  it('maps non-arm64 archs to the amd64 binaries', () => {
    const p = resolveKalamLibPath({
      repoRoot: '/repo',
      arch: 'x64',
      platform: 'darwin',
    });

    expect(p).toBe(path.resolve('/repo/build/mac/bin/amd64/kalam.dylib'));
  });

  it('throws on non-macOS platforms', () => {
    expect(() =>
      resolveKalamLibPath({ repoRoot: '/repo', arch: 'x64', platform: 'linux' })
    ).toThrow(/only supports macOS/);
  });

  it('defaults the repo root to three levels above the cli dir', () => {
    const p = resolveKalamLibPath({ arch: 'arm64', platform: 'darwin' });

    expect(p).toMatch(/build\/mac\/bin\/arm64\/kalam\.dylib$/);
    expect(path.isAbsolute(p)).toBe(true);
  });
});
