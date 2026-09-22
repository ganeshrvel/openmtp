const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const devConfig = require('./webpack.config.dev');
const prodConfig = require('./webpack.config.prod');

const IS_PROD = process.env.NODE_ENV === 'production';
const buildPath = path.join(__dirname, '..', '..', 'docs');
const templatesPath = path.join(__dirname, '..', 'templates');

// shared markup, dropped into every page with <%= nav %> and <%= footer %>.
// read on each build, so a rebuild picks up edits to the partials
const readPartial = (name) =>
  fs.readFileSync(path.join(templatesPath, 'partials', `${name}.html`), 'utf8');

// the footer is built from three pieces, so each page can carry only the
// parts it needs:
//   - about-window: the "About OpenMTP" mac-window card (index only)
//   - device-cloud: the "devices that work with OpenMTP" chip list
//     (index and the connect guide, where the chips back up the content)
//   - footer-legal: the copyright + About Us / Contact Us / Privacy policy
//     row (every page)
const FOOTER_PARTS = {
  index: ['about-window', 'device-cloud', 'footer-legal'],
  'how-to-connect-devices': ['device-cloud', 'footer-legal'],
};

// linking back to the connect guide only makes sense from other pages; on
// the guide itself the link would just point back to the page you're on
const HOW_TO_CONNECT_LINK =
  ' <a href="/how-to-connect-devices.html">How to connect your device to OpenMTP</a>.';

const buildDeviceCloud = (name) =>
  readPartial('device-cloud').replace(
    '{{HOW_TO_CONNECT_LINK}}',
    name === 'how-to-connect-devices' ? '' : HOW_TO_CONNECT_LINK
  );

const buildFooter = (name) => {
  const parts = (FOOTER_PARTS[name] || ['footer-legal']).map((part) =>
    part === 'device-cloud' ? buildDeviceCloud(name) : readPartial(part)
  );
  // the legal row's divider only makes sense when there's an About window
  // and/or device cloud sitting above it to separate from; the device
  // cloud's own divider only makes sense when the About window specifically
  // sits above it (home page only) - the connect guide has device-cloud as
  // its first footer piece, so it gets no divider there
  const footerParts = FOOTER_PARTS[name] || [];
  const footerClasses = ['section', 'section-sky', 'site-footer'];

  if (footerParts.length > 1) {
    footerClasses.push('site-footer-with-devices');
  }

  if (footerParts.includes('about-window')) {
    footerClasses.push('site-footer-with-about');
  }

  const footerClass = footerClasses.join(' ');

  return [
    `    <footer class="${footerClass}">`,
    '      <div class="container footer-inner">',
    ...parts,
    '      </div>',
    '    </footer>',
  ].join('\n');
};

// pages that render the device cloud themselves link the nav's "Devices" item
// to their own #supported-devices anchor; every other page links back to the
// homepage's, since that's the only place their cloud exists
const DEVICES_HREF = (name) =>
  FOOTER_PARTS[name] && FOOTER_PARTS[name].includes('device-cloud')
    ? '#supported-devices'
    : '/#supported-devices';

const buildNav = (name) =>
  readPartial('nav').replace('{{DEVICES_HREF}}', DEVICES_HREF(name));

// every page ships the same bundle: it carries the stylesheet, and its
// scripts (latest version, star count) fill in the shared footer too
const page = (name) =>
  new HtmlWebpackPlugin({
    template: `./docs-sources/templates/${name}.html`,
    inject: true,
    chunks: ['index'],
    filename: `${name}.html`,
    templateParameters: () => ({
      nav: buildNav(name),
      footer: buildFooter(name),
      copycatWarning: readPartial('copycat-warning'),
    }),
    minify: {
      collapseWhitespace: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true,
    },
  });

const baseConfig = {
  mode: process.env.NODE_ENV,
  entry: {
    index: './docs-sources/index.js',
  },
  output: {
    filename: 'bundle/[name].[hash:20].js',
    path: buildPath,
    assetModuleFilename: 'bundle/[name].[hash:20][ext]',
  },

  plugins: [
    page('index'),
    page('about-us'),
    page('contact-us'),
    page('how-to-connect-devices'),
    page('privacy'),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  edge: '12',
                },
              },
            ],
          ],
          cacheDirectory: true,
        },
      },
      {
        test: /\.(?:ico|jpe?g|png|gif|webp)$/i,
        type: 'asset/resource',
        // the page markup references these by a stable path, so they are
        // emitted to docs/images/<name> instead of a hashed bundle/ file
        generator: {
          filename: 'images/[name][ext]',
        },
      },
    ],
  },
};

module.exports = merge(baseConfig, IS_PROD ? prodConfig : devConfig);
