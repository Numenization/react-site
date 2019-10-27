const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./public/index.jsx",
  output: {
    path: path.resolve(__dirname, "./public/dist/"),
    filename: "bundle.js",
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ["file-loader"]
      }
    ]
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },
  mode: "development",
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, "./public/dist"),
    watchContentBase: true,
    historyApiFallback: true,
    proxy: [
      {
        context: ["/api", "/auth"],
        target: "http://localhost:5000",
        secure: false
      }
    ],
    port: 8080,
    overlay: {
      warnings: true,
      errors: true
    }
  }
};
