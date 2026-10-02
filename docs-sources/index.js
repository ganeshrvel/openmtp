import './styles/global.scss';
// emitted to docs/images/, which is where the <img> tags in the markup point
import './images/file-explorer.png';
import './images/file-transfer.png';
import './images/logo-small.png';
import './images/ganesh-pic.jpeg';
import { undefinedOrNull, fetchUrl, urls } from './utils/funcs';
import {
  APP_GITHUB_API_URL,
  APP_GITHUB_RELEASES_URL,
  APP_GITHUB_REPO_API_URL,
} from './utils/consts';

const DOWNLOAD_ARCHS = ['arm64', 'x64'];

class Docs {
  constructor() {
    this.selectors = {
      downloadBtn: {
        arm64: `#download-btn-github-arm64`,
        x64: `#download-btn-github-x64`,
      },
      gitHubLatestVersionWrapper: `.github-latest-version-wrapper`,
      gitHubLatestVersionTag: `.github-latest-version-tag`,
      gitHubStarsWrapper: `.github-stars-wrapper`,
      guideToc: `.guide-toc`,
      guideTocLinks: `.guide-toc a[href^="#"]`,
      guideSection: `.guide-section[id]`,
    };

    this.$el = {
      downloadBtn: {
        arm64: document.querySelector(this.selectors.downloadBtn.arm64),
        x64: document.querySelector(this.selectors.downloadBtn.x64),
      },
      gitHubLatestVersionWrapper: document.querySelectorAll(
        this.selectors.gitHubLatestVersionWrapper
      ),
      gitHubLatestVersionTag: document.querySelectorAll(
        this.selectors.gitHubLatestVersionTag
      ),
      gitHubStarsWrapper: document.querySelectorAll(
        this.selectors.gitHubStarsWrapper
      ),
      guideToc: document.querySelector(this.selectors.guideToc),
      guideTocLinks: document.querySelectorAll(this.selectors.guideTocLinks),
      guideSection: document.querySelectorAll(this.selectors.guideSection),
    };

    this.gitHubLatestReleaseData = null;
    this.gitHubLatestReleasePromise = null;
  }

  init() {
    this._highlightDownloadBtnForThisMac();

    const releasePromise = this._fetchLatestGitHubRelease();

    this._checkDownloadRequestUrl(releasePromise);
    this._fetchGitHubStars();
    this._initGuideTocScrollSpy();
  }

  // on 403 (rate limit) or any failure the placeholder is left untouched.
  // skipped on pages that don't show a star count
  _fetchGitHubStars = () => {
    if (!this.$el.gitHubStarsWrapper.length) {
      return;
    }

    fetchUrl({ url: APP_GITHUB_REPO_API_URL })
      .then((res) => {
        if (undefinedOrNull(res) || res.status !== 200) {
          return null;
        }

        return res.json.then((data) => {
          const stars = data && data.stargazers_count;

          if (typeof stars !== 'number') {
            return null;
          }

          const formatted = this._formatCount(stars);

          for (let i = 0; i < this.$el.gitHubStarsWrapper.length; i += 1) {
            this.$el.gitHubStarsWrapper[i].textContent = formatted;
          }

          return formatted;
        });
      })
      .catch(() => null);
  };

  // 7412 -> 7.4K, 12000 -> 12K, 950 -> 950
  _formatCount = (count) => {
    if (count < 1000) {
      return `${count}`;
    }

    const thousands = (count / 1000).toFixed(1).replace(/\.0$/, '');

    return `${thousands}K`;
  };

  // fetched once; every caller shares the same promise
  _fetchLatestGitHubRelease = () => {
    if (!undefinedOrNull(this.gitHubLatestReleasePromise)) {
      return this.gitHubLatestReleasePromise;
    }

    this.gitHubLatestReleasePromise = fetchUrl({ url: APP_GITHUB_API_URL })
      .then((res) => {
        if (undefinedOrNull(res)) {
          return null;
        }

        const { json, status } = res;

        return json.then((data) => {
          this.gitHubLatestReleaseData = this._parseGitHubRelease(data, status);
          this._applyReleaseData(this.gitHubLatestReleaseData);

          return this.gitHubLatestReleaseData;
        });
      })
      .catch(() => null);

    return this.gitHubLatestReleasePromise;
  };

  // on 403 (rate limit) or 404 the links stay on the releases page and the version placeholder is left untouched
  _parseGitHubRelease = (data, status) => {
    const release = {
      latestVersion: null,
      downloadUrls: {
        arm64: APP_GITHUB_RELEASES_URL,
        x64: APP_GITHUB_RELEASES_URL,
      },
    };

    if (status !== 200 || undefinedOrNull(data)) {
      return release;
    }

    if (typeof data.name === 'string' && data.name !== '') {
      release.latestVersion = data.name;
    }

    (data.assets || []).forEach((asset) => {
      const url = asset.browser_download_url || '';

      if (/mac-arm64\.dmg$/.test(url)) {
        release.downloadUrls.arm64 = url;
      } else if (/mac-x64\.dmg$/.test(url)) {
        release.downloadUrls.x64 = url;
      }
    });

    return release;
  };

  _applyReleaseData = ({ latestVersion, downloadUrls }) => {
    if (!undefinedOrNull(latestVersion)) {
      for (let i = 0; i < this.$el.gitHubLatestVersionWrapper.length; i += 1) {
        this.$el.gitHubLatestVersionWrapper[i].textContent = latestVersion;
      }

      // "OpenMTP-3.3.0" -> "v3.3.0"
      const versionNumber = latestVersion.match(/\d+(\.\d+)*/);

      if (versionNumber) {
        for (let i = 0; i < this.$el.gitHubLatestVersionTag.length; i += 1) {
          this.$el.gitHubLatestVersionTag[
            i
          ].textContent = `v${versionNumber[0]}`;
        }
      }
    }

    DOWNLOAD_ARCHS.forEach((arch) => {
      const btn = this.$el.downloadBtn[arch];

      if (btn) {
        btn.href = downloadUrls[arch];
      }
    });
  };

  // handles download links from OpenMTP's README:
  // ?downloadApp=github&release=stable&platform=mac&arch=arm64
  _checkDownloadRequestUrl = (releasePromise) => {
    const { downloadApp, release, platform, arch } = urls.get({});

    if ([downloadApp, release, platform, arch].some(undefinedOrNull)) {
      return;
    }

    if (platform !== 'mac' || DOWNLOAD_ARCHS.indexOf(arch) === -1) {
      return;
    }

    releasePromise
      .then((releaseData) => {
        window.location.href = undefinedOrNull(releaseData)
          ? APP_GITHUB_RELEASES_URL
          : releaseData.downloadUrls[arch];

        return null;
      })
      .catch(() => {});
  };

  // arm64 is the default recommendation in the html; switch only when the GPU clearly belongs to an Intel Mac
  _highlightDownloadBtnForThisMac = () => {
    if (this._detectMacArch() !== 'x64') {
      return;
    }

    const { arm64, x64 } = this.$el.downloadBtn;

    if (!arm64 || !x64) {
      return;
    }

    arm64.classList.remove('btn-primary');
    arm64.classList.add('btn-outline');
    x64.classList.remove('btn-outline');
    x64.classList.add('btn-primary');
  };

  // highlights the matching "On this page" link as its section scrolls
  // through the top band of the viewport, on scroll and on click
  _initGuideTocScrollSpy = () => {
    if (!this.$el.guideToc || !this.$el.guideSection.length) {
      return;
    }

    const linkByTargetId = {};

    this.$el.guideTocLinks.forEach((link) => {
      linkByTargetId[link.getAttribute('href').slice(1)] = link;
    });

    const setActive = (id) => {
      this.$el.guideTocLinks.forEach((link) => {
        link.classList.remove('is-active');
      });

      const activeLink = linkByTargetId[id];

      if (activeLink) {
        activeLink.classList.add('is-active');
      }
    };

    this.$el.guideTocLinks.forEach((link) => {
      link.addEventListener('click', () => {
        setActive(link.getAttribute('href').slice(1));
      });
    });

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    // a section counts as "current" once it has scrolled past the sticky
    // nav and into the top 30% of the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 }
    );

    this.$el.guideSection.forEach((section) => observer.observe(section));
  };

  _detectMacArch = () => {
    if (!/Macintosh|Mac OS X/.test(navigator.userAgent)) {
      return null;
    }

    try {
      const gl = document.createElement('canvas').getContext('webgl');

      if (!gl) {
        return null;
      }

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer =
        (debugInfo && gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) || '';

      if (/Apple M\d/.test(renderer)) {
        return 'arm64';
      }

      if (/Intel|AMD|Radeon|NVIDIA|GeForce/i.test(renderer)) {
        return 'x64';
      }

      // Safari reports "Apple GPU" on every Mac, so it can't tell
      return null;
    } catch (e) {
      return null;
    }
  };
}

const docsObj = new Docs();

docsObj.init();
