import './styles/global.scss';
import {
  imgsrc,
  undefinedOrNull,
  fetchUrl,
  imageLoaded,
  urls,
  setStyle,
} from './utils/funcs';
import { APP_GITHUB_API_URL, APP_GITHUB_URL } from './utils/consts';

class Docs {
  constructor() {
    this.selectors = {
      spinner: `.spinner`,
      appScreenshotFileExplorerImageWrapper: `#app-screenshot-file-explorer-wrapper`,
      appScreenshotFileTransferImageWrapper: `#app-screenshot-file-transfer-wrapper`,
      appScreenshotFileExplorerId: `app-screenshot-file-explorer`,
      appScreenshotFileTransferId: `app-screenshot-file-transfer`,
      downloadBtnGitHubArm64: `#download-btn-github-arm64`,
      downloadBtnGitHubX64: `#download-btn-github-x64`,
      navigateToGitHub: `#navigate-to-github`,
      gitHubLatestVersionWrapper: `.github-latest-version-wrapper`,
    };

    this.$el = {
      appScreenshotFileExplorerImageWrapper: document.querySelector(
        this.selectors.appScreenshotFileExplorerImageWrapper
      ),
      appScreenshotFileTransferImageWrapper: document.querySelector(
        this.selectors.appScreenshotFileTransferImageWrapper
      ),
      downloadBtnGitHubArm64: document.querySelector(
        this.selectors.downloadBtnGitHubArm64
      ),
      downloadBtnGitHubX64: document.querySelector(
        this.selectors.downloadBtnGitHubX64
      ),
      navigateToGitHub: document.querySelector(this.selectors.navigateToGitHub),
      gitHubLatestVersionWrapper: document.querySelectorAll(
        this.selectors.gitHubLatestVersionWrapper
      ),
    };

    this.gitHubLatestReleaseData = null;
    this.lazyLoadImages = {
      fileExplorer: {
        imgSrc: 'file-explorer.png',
        parentSelector: this.$el.appScreenshotFileExplorerImageWrapper,
        id: this.selectors.appScreenshotFileExplorerId,
        loader: this.selectors.spinner,
      },
      fileTransfer: {
        imgSrc: 'file-transfer.png',
        parentSelector: this.$el.appScreenshotFileTransferImageWrapper,
        id: this.selectors.appScreenshotFileTransferId,
        loader: this.selectors.spinner,
      },
    };
  }

  init() {
    this._checkLatestGitHubRelease();
    this._setHighlightDownloadBtnColor();
    this._checkDownloadRequestUrl();
    this._appScreenshotsLazyLoad();
    this._downloadBtnEvents();
    this._navigateToGithuBtnEvents();
  }

  _checkLatestGitHubRelease = () => {
    return fetchUrl({
      url: APP_GITHUB_API_URL,
    }).then((res) => {
      if (undefinedOrNull(res)) {
        return null;
      }

      const { json, status } = res;

      return json.then((data) => {
        this.gitHubLatestReleaseData =
          this._generateDownloadLatestGitHubReleaseUrl(data, status);

        return this._releaseInformationSet({ ...this.gitHubLatestReleaseData });
      });
    });
  };

  _generateDownloadLatestGitHubReleaseUrl = (data, status) => {
    const downloadableAssets = {
      latest: data ? data.name : `OpenMTP`,
      downloadUrls: {
        [`mac-arm64`]: {
          desc: `Apple Silicon`,
          url: `https://github.com/ganeshrvel/openmtp/releases/`,
        },
        [`mac-x64`]: {
          desc: `Intel Silicon`,
          url: `https://github.com/ganeshrvel/openmtp/releases/`,
        },
      },
    };

    if (status === 200) {
      if (data && data.assets && data.assets.length > 0) {
        data.assets.forEach((a) => {
          const match = a.name.match(/\.yml|\.yaml|\.zip$/);

          if (match) {
            return null;
          }

          const macX64Match = a.browser_download_url.match(/mac-x64\.dmg$/);
          const macArm64Match = a.browser_download_url.match(/mac-arm64\.dmg$/);

          if (macX64Match) {
            downloadableAssets.downloadUrls[`mac-x64`].url = macX64Match.input;
          } else if (macArm64Match) {
            downloadableAssets.downloadUrls[`mac-arm64`].url =
              macArm64Match.input;
          }
        });
      }
    }

    // if api request limit gets exhausted or api is not found, then forward the url to github releases page
    return downloadableAssets;
  };

  // if the github releases api has already been resolved then return it else wait for the the github release api fetch to complete and redirect to the appropriate download url
  _forceDownloadLatestGitHubRelease = ({ platform, arch }) => {
    if (!undefinedOrNull(this.gitHubLatestReleaseData)) {
      return this.gitHubLatestReleaseData;
    }

    this._checkLatestGitHubRelease()
      .then(() => {
        if (undefinedOrNull(this.gitHubLatestReleaseData)) {
          return null;
        }

        window.location.href =
          this.gitHubLatestReleaseData.downloadUrls[`${platform}-${arch}`].url;

        return true;
      })
      .catch(() => {});

    return null;
  };

  // used for handling the download requests originating from OpenMTP's README file
  _checkDownloadRequestUrl = () => {
    const { downloadApp, release, platform, arch } = urls.get({});

    if (
      undefinedOrNull(downloadApp) ||
      undefinedOrNull(arch) ||
      undefinedOrNull(release) ||
      undefinedOrNull(platform)
    ) {
      return null;
    }

    switch (downloadApp) {
      case 'github':
      default:
        if (!this._forceDownloadLatestGitHubRelease({ platform, arch })) {
          return null;
        }

        window.location.href =
          this.gitHubLatestReleaseData.downloadUrls[`${platform}-${arch}`].url;
        break;
    }
  };

  _appScreenshotsLazyLoad = () => {
    Object.keys(this.lazyLoadImages).map((a) => {
      const item = this.lazyLoadImages[a];
      const imgLoad = imgsrc(item.imgSrc);

      return imageLoaded(imgLoad)
        .then((res) => {
          if (!res.status) {
            return null;
          }

          if (!undefinedOrNull(item.loader)) {
            const loader = item.parentSelector.querySelector(item.loader);

            item.parentSelector.removeChild(loader);
          }

          this._createImg(res.src, item.parentSelector, item.id);

          return true;
        })
        .catch(() => {});
    });
  };

  _createImg = (src, parentSelector, id) => {
    const img = document.createElement('img');

    img.src = src;
    img.id = id;
    parentSelector.appendChild(img);
  };

  _downloadBtnEvents = () => {
    this.$el.downloadBtnGitHubArm64.addEventListener('click', (e) => {
      e.preventDefault();
      const platform = 'mac';
      const arch = 'arm64';

      if (!this._forceDownloadLatestGitHubRelease({ platform, arch })) {
        return null;
      }

      window.location.href =
        this.gitHubLatestReleaseData.downloadUrls[`${platform}-${arch}`].url;
    });
    this.$el.downloadBtnGitHubX64.addEventListener('click', (e) => {
      e.preventDefault();
      const platform = 'mac';
      const arch = 'x64';

      if (!this._forceDownloadLatestGitHubRelease({ platform, arch })) {
        return null;
      }

      window.location.href =
        this.gitHubLatestReleaseData.downloadUrls[`${platform}-${arch}`].url;
    });
  };

  _navigateToGithuBtnEvents = () => {
    this.$el.navigateToGitHub.addEventListener('click', (events) => {
      events.preventDefault();

      window.location.href = APP_GITHUB_URL;
    });
  };

  _releaseInformationSet = ({ latest, url: _ }) => {
    for (let i = 0; i < this.$el.gitHubLatestVersionWrapper.length; i += 1) {
      this.$el.gitHubLatestVersionWrapper[i].innerHTML = latest;
    }
  };

  // highlight the download button according to the architecture of the OS
  _setHighlightDownloadBtnColor = () => {
    if (this._isMacArm64Machine()) {
      setStyle(this.$el.downloadBtnGitHubArm64, {
        [`background-color`]: `transparent`,
        color: `var(--fbc-blue-60)`,
        [`border-color`]: `var(--fbc-blue-60)`,
      });
    }
  };

  _isMacArm64Machine = () => {
    const w = document.createElement('canvas').getContext('webgl');
    const d = w.getExtension('WEBGL_debug_renderer_info');
    const g = (d && w.getParameter(d.UNMASKED_RENDERER_WEBGL)) || '';

    return g.match(/Apple/) && !g.match(/Apple GPU/);
  };
}

const docsObj = new Docs();

docsObj.init();
