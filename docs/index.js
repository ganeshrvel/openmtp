'use strict';

import './styles/global.scss';
import {
  imgsrc,
  undefinedOrNull,
  fetchUrl,
  imageLoaded,
  urls
} from './utils/funcs';

const APP_GITHUB_URL = `https://github.com/ganeshrvel/openmtp`;
const APP_GITHUB_API_URL = `https://api.github.com/repos/ganeshrvel/openmtp/releases/latest`;

class Docs {
  constructor() {
    this.selectors = {
      appScreenshotFileExplorerImageWrapper: `#app-screenshot-file-explorer-wrapper`,
      appScreenshotFileExplorer: `app-screenshot-file-explorer`,
      downloadBtnGitHub: `#download-btn-github`,
      navigateToGitHub: `#navigate-to-github`,
      gitHubLatestVersionWrapper: `.github-latest-version-wrapper`
    };

    this.elements = {
      appScreenshotFileExplorerImageWrapper: document.querySelector(
        this.selectors.appScreenshotFileExplorerImageWrapper
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
      fileExplorer: 'file-explorer.jpg'
    };
  }
  init() {
    this._checkLatestGitHubRelease();
    this._checkDownloadRequestUrl();
    this._appScreenshotFileExplorerLazyLoad();
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
    //if api request limit gets exhausted forward the url to releases page
    if (status === 403) {
      return {
        latest: `OpenMTP`,
        url: {
          mac: `https://github.com/ganeshrvel/openmtp/releases/`
        }
      };
    }

    return {
      latest: data.name,
      url: {
        mac: `https://github.com/ganeshrvel/openmtp/releases/download/${
          data.tag_name
        }/${data.name}-mac.zip`
      }
    };
  };

  _forceDownloadLatestGitHubRelease = platform => {
    if (!undefinedOrNull(this.gitHubLatestReleaseData)) {
      return this.gitHubLatestReleaseData;
    }

    this._checkLatestGitHubRelease().then(() => {
      if (undefinedOrNull(this.gitHubLatestReleaseData)) {
        return null;
      }

      window.location.href = this.gitHubLatestReleaseData.url[platform];
    });

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

  _appScreenshotFileExplorerLazyLoad = () => {
    const appScreenshotFileExplorerImgLoad = imgsrc(
      this.lazyLoadImages['fileExplorer']
    );

    imageLoaded(appScreenshotFileExplorerImgLoad).then(res => {
      if (!res.status) {
        return null;
      }
      this._createImg(res.src);
    });
  };

  _createImg = src => {
    const img = document.createElement('img');
    img.src = src;
    img.id = this.selectors.appScreenshotFileExplorer;
    this.elements.appScreenshotFileExplorerImageWrapper.appendChild(img);
  };

  _downloadBtnEvents = () => {
    this.elements.downloadBtnGitHub.addEventListener('click', e => {
      e.preventDefault();
      const platform = 'mac';

      if (!this._forceDownloadLatestGitHubRelease(platform)) {
        return null;
      }

      window.location.href = this.gitHubLatestReleaseData.url[platform];
    });
  };

  _navigateToGithuBtnEvents = () => {
    this.elements.navigateToGitHub.addEventListener('click', e => {
      e.preventDefault();

      window.location.href = APP_GITHUB_URL;
    });
  };

  _releaseInformationSet = ({ latest, url }) => {
    for (let i = 0; i < this.elements.gitHubLatestVersionWrapper.length; i++) {
      this.elements.gitHubLatestVersionWrapper[i].innerHTML = `<a href="${
        url.mac
      }">${latest}</a>`;
    }
  };
}

const docsObj = new Docs();
docsObj.init();
