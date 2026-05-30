const expo = require('eslint-config-expo/flat');

module.exports = [
  ...expo,
  {
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
