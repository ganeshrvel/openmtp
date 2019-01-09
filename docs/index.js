'use strict';

import './styles/global.scss';
import { imageLoaded } from '../app/vendors/useful-js-snippets/tools';
import { imgsrc, undefinedOrNull, fetchUrl } from './utils/funcs';

const APP_GITHUB_URL = `https://github.com/ganeshrvel/openmtp`;
const APP_NAME = `OpenMTP`;

class Docs {
  constructor() {
    this.selectors = {
      appScreenshotFileExplorerImageWrapper: `#app-screenshot-file-explorer-wrapper`,
      appScreenshotFileExplorer: `app-screenshot-file-explorer`,
      downloadBtnGitHub: `#download-btn-github`,
      navigateToGitHub: `#navigate-to-github`,
      gitHubLatestVersionWrapper: `#github-latest-version-wrapper`
    };

    this.elements = {
      appScreenshotFileExplorerImageWrapper: document.querySelector(
        this.selectors.appScreenshotFileExplorerImageWrapper
      ),
      downloadBtnGitHub: document.querySelector(
        this.selectors.downloadBtnGitHub
      ),
      navigateToGitHub: document.querySelector(this.selectors.navigateToGitHub),
      gitHubLatestVersionWrapper: document.querySelector(
        this.selectors.gitHubLatestVersionWrapper
      )
    };

    this.openMtpGitHubApiUrl = `https://api.github.com/repos/ganeshrvel/openmtp/tags`;
    this.gitHubLatestReleaseData = null;
    this.lazyLoadImages = {
      fileExplorer: 'file-explorer.jpg'
    };
  }
  init() {
    this._checkLatestGitHubRelease();
    this._appScreenshotFileExplorerLazyLoad();
    this._downloadBtnEvents();
    this._navigateToGithuBtnEvents();
  }

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

      if (undefinedOrNull(this.gitHubLatestReleaseData)) {
        this._checkLatestGitHubRelease();
        return null;
      }
      window.location.href = this.gitHubLatestReleaseData.zipball_url;
    });
  };

  _navigateToGithuBtnEvents = () => {
    this.elements.navigateToGitHub.addEventListener('click', e => {
      e.preventDefault();

      window.location.href = APP_GITHUB_URL;
    });
  };

  _checkLatestGitHubRelease = () => {
    fetchUrl({
      url: this.openMtpGitHubApiUrl
    }).then(res => {
      if (
        undefinedOrNull(res) ||
        undefinedOrNull(res[0]) ||
        undefinedOrNull(res[0].zipball_url)
      ) {
        return null;
      }
      this.gitHubLatestReleaseData = res[0];

      this._releaseInformationSet({
        latest: this.gitHubLatestReleaseData.name,
        url: this.gitHubLatestReleaseData.zipball_url
      });
    });
  };

  _releaseInformationSet = ({ latest, url }) => {
    this.elements.gitHubLatestVersionWrapper.innerHTML = `<a href="${url}">${APP_NAME} ${latest}</a>`;
  };
}

const docsObj = new Docs();
docsObj.init();
