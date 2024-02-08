module.exports = {
    env: {
        node: true,
    },
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'simple-import-sort'],
    rules: {
        curly: 'error',
        'no-debugger': 'error',
        'no-eval': 'error',
        'no-console': [
            'error',
            {
                allow: ['warn', 'error', 'info', 'dir', 'clear'],
            },
        ],
        'no-dupe-args': 'error',
        'no-duplicate-imports': 'error',
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                vars: 'all',
                args: 'none',
            },
        ],
        '@typescript-eslint/no-magic-numbers': [
            'error',
            {
                ignore: [-1, 0, 1, 2, 100],
                ignoreEnums: true,
            },
        ],
        'no-warning-comments': ['error', { terms: ['BIB'] }], // bring it back
        'no-restricted-imports': [
            'warn',
            {
                patterns: ['**/../*', '**/./*'],
            },
        ],
        'simple-import-sort/imports': [
            'warn',
            {
                groups: [
                    // Node.js builtins. You could also generate this regex if you use a `.js` config
                    // For example: `^(${require("module").builtinModules.join("|")})(/|$)`
                    [
                        '^node:',
                        '^(assert|buffer|child_process|cluster|console|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
                    ],
                    // Packages. `react` related packages come first
                    ['^@?\\w'],
                    // Side effect imports.
                    ['^\\u0000'],
                    ['^consts/'],
                    ['^types/'],
                    ['^libs/'],
                    ['^controllers/'],
                    // Parent imports. Put `..` last
                    ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                    // Other relative imports. Put same-folder imports and `.` last
                    ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                ],
            },
        ],
    },
};
