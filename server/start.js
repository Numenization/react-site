// Transpile all code following this line with babel and use '@babel/preset-env' (aka ES6) preset.
require("@babel/register")({
  presets: ["@babel/preset-env"]
});

import "core-js/stable";
import "regenerator-runtime/runtime";

// Import the rest of our application.
module.exports = require("./server.js");
