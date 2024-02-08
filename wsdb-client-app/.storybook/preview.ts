import type { Preview } from '@storybook/react';

import '../src/shared/styles/desktop.css';

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        options: {
            storySort: {
                order: ['app', 'widgets', 'pages', 'features', 'entities', 'shared', '*'],
            },
        },
    },
};

export default preview;
