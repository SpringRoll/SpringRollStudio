module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  globals: {
    __static: true
  },
  plugins: [
    'html'
  ],
  'rules': {
    "prefer-const": [
      "error",
      {
        destructuring: "any",
        ignoreReadBeforeAssign: false
      }
    ],
    "space-before-blocks": [
      "error",
      { functions: "always", keywords: "always", classes: "always" }
    ],
    "keyword-spacing": ["error"],
    indent: ["error", 2],
    semi: ["error", "always", { omitLastInOneLineBlock: true }],
    "no-console": [0],
    quotes: [2, "single"],
    curly: ["error", "all"],
    "no-var": "error",
    
    // Standard rules from template

    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
