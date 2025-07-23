// .eslintrc.js
module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn', // Changed from 'warn' to 'off'
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
};