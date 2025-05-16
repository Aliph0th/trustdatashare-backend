module.exports = {
   parser: '@typescript-eslint/parser',
   parserOptions: {
      project: 'tsconfig.json',
      tsconfigRootDir: __dirname,
      sourceType: 'module'
   },
   plugins: ['@typescript-eslint/eslint-plugin'],
   extends: ['plugin:react/recommended', 'plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
   settings: {
      react: {
         version: 'detect'
      }
   },
   root: true,
   env: {
      node: true,
      jest: true
   },
   ignorePatterns: ['.eslintrc.js'],
   rules: {
      'prettier/prettier': 'warn',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
         'warn',
         {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_'
         }
      ]
   }
};
