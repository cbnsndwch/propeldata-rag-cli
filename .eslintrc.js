module.exports = {
    root: true,
    env: {
        browser: true,
        es6: true,
        node: true
    },
    extends: [
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module'
    },
    plugins: ['@typescript-eslint', 'import', 'prettier'],
    ignorePatterns: [
        '**/*.json',
        '.eslintrc*',
        'vitest.config.ts',
        'typedoc.base.json',
        'typedoc.*'
    ],
    rules: {
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-empty-interface': 'warn',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-unnecessary-type-assertion': 'error',
        '@typescript-eslint/prefer-for-of': 'warn',
        '@typescript-eslint/triple-slash-reference': 'error',
        '@typescript-eslint/unified-signatures': 'warn',
        'comma-dangle': 'off',
        'constructor-super': 'error',
        eqeqeq: ['warn', 'always'],
        'import/no-named-as-default': 'off',
        'import/no-deprecated': 'warn',
        'import/no-extraneous-dependencies': 'error',
        'import/no-unassigned-import': 'warn',
        'no-cond-assign': 'error',
        'no-duplicate-case': 'error',
        'no-duplicate-imports': 'error',
        'no-empty': [
            'error',
            {
                allowEmptyCatch: true
            }
        ],
        'no-invalid-this': 'error',
        'no-new-wrappers': 'error',
        'no-param-reassign': 'error',
        'no-redeclare': 'error',
        'no-sequences': 'error',
        'no-shadow': 'off',
        'no-throw-literal': 'error',
        'no-unsafe-finally': 'error',
        'no-unused-labels': 'error',
        'no-var': 'warn',
        'no-void': 'error',
        'prefer-const': 'warn'
    },
    settings: {
        jsdoc: {
            tagNamePreference: {
                returns: 'return'
            }
        }
    },
    overrides: [
        {
            files: ['test/**/*.ts'],
            parserOptions: {
                project: 'tsconfig.test.json',
                sourceType: 'module'
            },
            rules: {
                'import/no-extraneous-dependencies': 'off'
            }
        }
    ]
};
