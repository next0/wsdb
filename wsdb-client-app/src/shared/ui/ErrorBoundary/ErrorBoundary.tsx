import * as React from 'react';

export interface ErrorBoundaryFallbackProps {
    error: Error;
}

export interface ErrorBoundaryProps extends React.PropsWithChildren {
    fallback: React.ReactNode | ((props: ErrorBoundaryFallbackProps) => React.ReactElement);
    extra?: Record<string, string | number>;
}

export interface ErrorBoundaryState {
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state = { error: null };

    static getDerivedStateFromError(error: Error) {
        return {
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // TODO: implement app logger
        console.error('ERROR_BOUNDARY', error, {
            ...this.props.extra,
            ...errorInfo,
        });
    }

    render() {
        const { error } = this.state;

        if (error) {
            const { fallback, children } = this.props;

            if (!fallback) {
                return children;
            }

            if (typeof fallback === 'function') {
                const FallbackComponent = fallback;

                return <FallbackComponent error={error} />;
            } else {
                return fallback as React.ReactNode;
            }
        }

        return this.props.children;
    }
}
