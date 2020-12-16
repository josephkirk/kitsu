module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue'
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
    "js-3d-model-viewer": "<rootDir>/tests/substituted-model-viewer.js",
    "vue-slider-component": "<rootDir>/tests/substituted-model-viewer.js",
    "fabric": "<rootDir>/tests/fabric.js",
    "vue-loading-spinner": "<rootDir>/tests/spinner.js"
=======
    'js-3d-model-viewer': '<rootDir>/tests/substituted-model-viewer.js',
    'vue-slider-component': '<rootDir>/tests/substituted-model-viewer.js',
    fabric: '<rootDir>/tests/fabric.js'
>>>>>>> caf16d6c (Add electron)
=======
    "js-3d-model-viewer": "<rootDir>/tests/substituted-model-viewer.js",
    "vue-slider-component": "<rootDir>/tests/substituted-model-viewer.js",
    "fabric": "<rootDir>/tests/fabric.js"
>>>>>>> 1af13f21 (Revert "Add electron")
=======
    'js-3d-model-viewer': '<rootDir>/tests/substituted-model-viewer.js',
    'vue-slider-component': '<rootDir>/tests/substituted-model-viewer.js',
    fabric: '<rootDir>/tests/fabric.js'
>>>>>>> f4faebb5 (Add electron)
=======
    "js-3d-model-viewer": "<rootDir>/tests/substituted-model-viewer.js",
    "vue-slider-component": "<rootDir>/tests/substituted-model-viewer.js",
    "fabric": "<rootDir>/tests/fabric.js"
>>>>>>> ee7fffeb (Revert "Add electron")
  },
  setupFiles: ['<rootDir>/tests/setup.js'],
  snapshotSerializers: [
    'jest-serializer-vue'
  ],
  testMatch: [
    '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],
  testURL: 'http://localhost/',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
}
