const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const templateDirectoryUri = 'httpdocs/wp-content/themes/wp-dev';
const pagesDirectory = path.join(__dirname, `${templateDirectoryUri}/assets/scripts/pages`);

// ページごとのエントリーポイントを自動的に構築
function generateEntries() {
  const entries = {};
  // ディレクトリが存在するか確認
  if (fs.existsSync(pagesDirectory)) {
    const directories = fs.readdirSync(pagesDirectory, { withFileTypes: true });

    directories.forEach(dir => {
      if (dir.isDirectory()) {
        const pageName = dir.name;
        entries[pageName] = path.resolve(pagesDirectory, `${pageName}/index.js`);
      }
    });
  } else {
    console.error(`Pages directory (${pagesDirectory}) does not exist.`);
  }

  entries['common'] = path.resolve(__dirname, `${templateDirectoryUri}/assets/scripts/common.js`);

  return entries;
}

module.exports = {
  mode: 'production',
  entry: generateEntries(),
  output: {
    path: path.resolve(__dirname, `${templateDirectoryUri}/assets/scripts/pages`),
    filename: (pathData) => {
      return pathData.chunk.name === 'common' ? '../common.bundle.js' : `[name]/index.bundle.js`;
    },
    environment: {
      arrowFunction: false
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env',{
                  useBuiltIns: 'entry',
                  corejs: 3,
                }],
              ],
            },
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              import: false,
              url: false,
            }
          },
          'sass-loader',
        ]
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../../../assets/styles/pages/[name]/style.bundle.css'
    })
  ],
  watchOptions: {
    ignored: /node_modules/
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  }
};
