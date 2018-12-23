'use strict';

import { APP_NAME, APP_VERSION, AUTHOR_EMAIL } from '../constants/meta';

export const loadProfileErrorHtml = `
        <html lang="en-gb">
          <body>
              <h3>Unable to load profile files. Please restart the app. </h3>
              <p>Write to the developer if the problem persists.</p>
              <a href="mailto:${AUTHOR_EMAIL}?Subject=Unable to load profile files&Body=${APP_NAME} - ${APP_VERSION}">${AUTHOR_EMAIL}</a>
          </body>
        </html>
      `;
