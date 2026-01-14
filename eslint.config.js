export default [
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                localStorage: 'readonly',
                indexedDB: 'readonly',
                navigator: 'readonly',
                crypto: 'readonly',
                URL: 'readonly',
                Blob: 'readonly',
                FileReader: 'readonly',
                FormData: 'readonly',
                fetch: 'readonly',
                setTimeout: 'readonly',
                marked: 'readonly' // Loaded via CDN for markdown rendering
            }
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'semi': ['error', 'always'],
            'quotes': ['error', 'single', { avoidEscape: true }]
        }
    },
    {
        ignores: ['node_modules/', 'genesis/', 'tests/', 'js/lib/**', '**/*.min.js']
    }
];

