import * as React from 'react';

export interface UseBoolean {
    state: boolean;
    on: () => void;
    off: () => void;
    toggle: () => void;
    set: (v: boolean) => void;
}

export function useBoolean(defaultState?: boolean): UseBoolean {
    const [state, setState] = React.useState(defaultState ?? false);

    const on = React.useCallback(() => setState(true), []);
    const off = React.useCallback(() => setState(false), []);
    const toggle = React.useCallback(() => setState((state) => !state), []);

    return React.useMemo(() => {
        return { state, on, off, toggle, set: setState };
    }, [state, on, off, toggle]);
}
