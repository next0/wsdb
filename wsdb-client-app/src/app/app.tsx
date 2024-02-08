import * as React from 'react';
import ReactDOM from 'react-dom/client';

import 'shared/styles/desktop.css';

import { App } from 'app/ui/App/App';

import { reportWebVitals } from 'shared/helpers/reportWebVitals/reportWebVitals';

function main() {
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );

    reportWebVitals((metric) => {
        console.info('Web Vitals Metric', metric);
    });
}

main();
