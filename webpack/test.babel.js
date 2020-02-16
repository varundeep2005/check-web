import nodeExternals from 'webpack-node-externals';
import path from 'path';

export default {
  target: 'node',
  externals: [nodeExternals()],
  module: {
    loaders: [
      {
        test: /\.js/,
        include: path.resolve('src'),
        loader: 'istanbul-instrumenter-loader'
      },
      {
        test: /Modern\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: { presets: ['es2015', 'stage-0', 'react'], plugins: [["relay", { "compat": true, "schema": "../relay.json" }]]},
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules|Modern\.js/,
        query: { presets: ['es2015', 'stage-0', 'react'], plugins: [path.join(__dirname, './babelRelayPlugin.js')] },
      },
      {
        test: /\.css?$/,
        loaders: ['style-loader', 'raw-loader']
      }
    ]
  }
};
