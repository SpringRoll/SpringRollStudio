module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2020,
    sourceType: "module"
  },
  env: {
    browser: true,
    node: true
  },
  extends: [
    'plugin:vue/recommended'
  ],
  globals: {
    __static: true
  },
  plugins: [
    'vue'
  ],
  rules: {
    "prefer-const": [
      "error",
      {
        destructuring: "any",
        ignoreReadBeforeAssign: false
      }
    ],
    "space-before-blocks": [
      "error",
      { functions: "always", "keywords": "always", "classes": "always" }
    ],
    "keyword-spacing": ["error"],
    indent: ["error", 2],

    "vue/max-attributes-per-line": "off",
    "vue/singleline-html-element-content-newline": "off",
    "vue/html-self-closing": "off",

    semi: ["error", "always"],
    "no-console": [0],
    quotes: [2, "single"],
    curly: ["error", "all"],
    "no-var": "error",
    "require-jsdoc": [
      "error",
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: true
        }
      }
    ]
  }
}
