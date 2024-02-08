import * as React from 'react';

import { LoadingMessage } from 'shared/ui/LoadingMessage/LoadingMessage';

export interface AppPageProps extends React.PropsWithChildren {}

export function AppPage({ children }: AppPageProps) {
    return <React.Suspense fallback={<LoadingMessage message='Loading page...' />}>{children}</React.Suspense>;
}
