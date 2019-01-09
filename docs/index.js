'use strict';
import './styles/global.scss';
import { imageLoaded } from '../app/vendors/useful-js-snippets/tools';
import { imgsrc } from './utils/functs';
import { fetchUrl } from '../app/api/www';
import { undefinedOrNull } from '../app/utils/funcs';

class Docs {
  constructor() {
    this.selectors = {
      appScreenshotFileExplorerImageWrapper: `#app-screenshot-file-explorer-wrapper`,
      appScreenshotFileExplorer: `app-screenshot-file-explorer`,
      downloadBtnGithub: `#download-btn-github`
    };

    this.elements = {
      appScreenshotFileExplorerImageWrapper: document.querySelector(
        this.selectors.appScreenshotFileExplorerImageWrapper
      ),
      downloadBtnGithub: document.querySelector(
        this.selectors.downloadBtnGithub
      )
    };

    this.openmtpApi = `https://api.github.com/repos/ganeshrvel/openmtp/tags`;

    this.lazyLoadImages = {
      fileExplorer: 'file-explorer.jpg'
    };
  }
  init() {
    this._appScreenshotFileExplorerLazyLoad();
    this._downloadBtnEvents();
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
    this.elements.downloadBtnGithub.addEventListener('click', e => {
      e.preventDefault();

      this._downloadRelease('github');
    });
  };

  _downloadRelease = (source = 'github') => {
    switch (source) {
      case 'github':
      default:
        fetchUrl({
          url: this.openmtpApi
        }).then(res => {
          if (
            undefinedOrNull(res) ||
            undefinedOrNull(res[0]) ||
            undefinedOrNull(res[0].zipball_url)
          ) {
            return null;
          }

          window.location.href = res[0].zipball_url;
        });
        break;
    }
  };
}

const docsObj = new Docs();
docsObj.init();
