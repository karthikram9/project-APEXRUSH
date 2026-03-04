import jsHelpers from '@eslint/js'

export default [
  jsHelpers.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  }
]
