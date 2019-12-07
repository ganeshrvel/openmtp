'use strict';

import './styles/global.scss';
import {
  imgsrc,
  undefinedOrNull,
  fetchUrl,
  imageLoaded,
  urls
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
      downloadBtnGitHub: `#download-btn-github`,
      navigateToGitHub: `#navigate-to-github`,
      gitHubLatestVersionWrapper: `.github-latest-version-wrapper`
    };

    this.$el = {
      appScreenshotFileExplorerImageWrapper: document.querySelector(
        this.selectors.appScreenshotFileExplorerImageWrapper
      ),
      appScreenshotFileTransferImageWrapper: document.querySelector(
        this.selectors.appScreenshotFileTransferImageWrapper
      ),
      downloadBtnGitHub: document.querySelector(
        this.selectors.downloadBtnGitHub
      ),
      navigateToGitHub: document.querySelector(this.selectors.navigateToGitHub),
      gitHubLatestVersionWrapper: document.querySelectorAll(
        this.selectors.gitHubLatestVersionWrapper
      )
    };

    this.gitHubLatestReleaseData = null;
    this.lazyLoadImages = {
      fileExplorer: {
        imgSrc: 'file-explorer.jpg',
        parentSelector: this.$el.appScreenshotFileExplorerImageWrapper,
        id: this.selectors.appScreenshotFileExplorerId,
        loader: this.selectors.spinner
      },
      fileTransfer: {
        imgSrc: 'file-transfer.jpg',
        parentSelector: this.$el.appScreenshotFileTransferImageWrapper,
        id: this.selectors.appScreenshotFileTransferId,
        loader: this.selectors.spinner
      }
    };
  }

  init() {
    this._checkLatestGitHubRelease();
    this._checkDownloadRequestUrl();
    this._appScreenshotsLazyLoad();
    this._downloadBtnEvents();
    this._navigateToGithuBtnEvents();
  }

  _checkLatestGitHubRelease = () => {
    return fetchUrl({
      url: APP_GITHUB_API_URL
    }).then(res => {
      if (undefinedOrNull(res)) {
        return null;
      }

      const { json, status } = res;

      return json.then(data => {
        this.gitHubLatestReleaseData = this._generateDownloadLatestGitHubReleaseUrl(
          data,
          status
        );

        return this._releaseInformationSet({ ...this.gitHubLatestReleaseData });
      });
    });
  };

  _generateDownloadLatestGitHubReleaseUrl = (data, status) => {
    if (status === 200) {
      return {
        latest: data.name,
        url: {
          mac: `https://github.com/ganeshrvel/openmtp/releases/download/${data.tag_name}/${data.name}.dmg`
        }
      };
    }

    // if api request limit gets exhausted or api is not found forward the url to github releases page
    return {
      latest: `OpenMTP`,
      url: {
        mac: `https://github.com/ganeshrvel/openmtp/releases/`
      }
    };
  };

  _forceDownloadLatestGitHubRelease = platform => {
    if (!undefinedOrNull(this.gitHubLatestReleaseData)) {
      return this.gitHubLatestReleaseData;
    }

    this._checkLatestGitHubRelease()
      .then(() => {
        if (undefinedOrNull(this.gitHubLatestReleaseData)) {
          return null;
        }

        window.location.href = this.gitHubLatestReleaseData.url[platform];
        return true;
      })
      .catch(() => {});

    return null;
  };

  _checkDownloadRequestUrl = () => {
    const { downloadApp, release, platform } = urls.get({});

    if (
      undefinedOrNull(downloadApp) ||
      undefinedOrNull(release) ||
      undefinedOrNull(platform)
    ) {
      return null;
    }

    switch (downloadApp) {
      case 'github':
      default:
        if (!this._forceDownloadLatestGitHubRelease(platform)) {
          return null;
        }

        window.location.href = this.gitHubLatestReleaseData.url[platform];
        break;
    }
  };

  _appScreenshotsLazyLoad = () => {
    Object.keys(this.lazyLoadImages).map(a => {
      const item = this.lazyLoadImages[a];
      const imgLoad = imgsrc(item.imgSrc);

      return imageLoaded(imgLoad)
        .then(res => {
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
    this.$el.downloadBtnGitHub.addEventListener('click', e => {
      e.preventDefault();
      const platform = 'mac';

      if (!this._forceDownloadLatestGitHubRelease(platform)) {
        return null;
      }

      window.location.href = this.gitHubLatestReleaseData.url[platform];
    });
  };

  _navigateToGithuBtnEvents = () => {
    this.$el.navigateToGitHub.addEventListener('click', events => {
      events.preventDefault();

      window.location.href = APP_GITHUB_URL;
    });
  };

  _releaseInformationSet = ({ latest, url }) => {
    for (let i = 0; i < this.$el.gitHubLatestVersionWrapper.length; i += 1) {
      this.$el.gitHubLatestVersionWrapper[
        i
      ].innerHTML = `<a href="${url.mac}">${latest}</a>`;
    }
  };
}

const docsObj = new Docs();
docsObj.init();
