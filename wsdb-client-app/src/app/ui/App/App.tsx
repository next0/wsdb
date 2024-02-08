import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppError } from 'app/ui/AppError/AppError';
import { AppLayout } from 'app/ui/AppLayout/AppLayout';
import { AppPage } from 'app/ui/AppPage/AppPage';
import { AppSidebarNav } from 'app/ui/AppSidebarNav/AppSidebarNav';

import { Toaster } from 'shared/libs/ui/toaster';
import { ErrorBoundary } from 'shared/ui/ErrorBoundary/ErrorBoundary';

const HomePage = React.lazy(() => import('pages/HomePage'));
const TablePage = React.lazy(() => import('pages/TablePage'));
const Error404Page = React.lazy(() => import('pages/Error404Page'));

const queryClient = new QueryClient();

export function App() {
    return (
        <ErrorBoundary fallback={AppError}>
            <React.Suspense fallback={null}>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <AppLayout sidebar={<AppSidebarNav />}>
                            <AppPage>
                                <Routes>
                                    <Route
                                        path='/'
                                        element={<HomePage />}
                                    />
                                    <Route
                                        path='/table/:name'
                                        element={<TablePage />}
                                    />
                                    <Route
                                        path='*'
                                        element={<Error404Page />}
                                    />
                                </Routes>
                            </AppPage>
                        </AppLayout>
                        <Toaster />
                    </BrowserRouter>
                </QueryClientProvider>
            </React.Suspense>
        </ErrorBoundary>
    );
}
